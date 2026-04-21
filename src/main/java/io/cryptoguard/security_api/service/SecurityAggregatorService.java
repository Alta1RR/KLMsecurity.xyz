package io.cryptoguard.security_api.service;
import io.cryptoguard.security_api.Repository.ChainRepository;
import io.cryptoguard.security_api.Repository.ReportRepository;
import io.cryptoguard.security_api.dto.GoPlusResponse;
import io.cryptoguard.security_api.dto.MoralisBalanceResponse;
import io.cryptoguard.security_api.dto.ReportRequest;
import io.cryptoguard.security_api.dto.ScorechainResponse;
import io.cryptoguard.security_api.dto.VirusTotalResponse;
import io.cryptoguard.security_api.dto.WalletCheckResponse;
import io.cryptoguard.security_api.model.Chain;
import io.cryptoguard.security_api.model.WalletReport;
import io.cryptoguard.security_api.util.InputValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SecurityAggregatorService {

    private static final DateTimeFormatter REPORT_TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy, HH:mm:ss");

    private static final Duration EXTERNAL_CALL_TIMEOUT = Duration.ofSeconds(8);

    @Value("${moralis.api.key:}")
    private String moralisKey;

    @Value("${scorechain.api.key:}")
    private String scorechainKey;

    @Value("${virustotal.api.key:}")
    private String vtKey;

    @Value("${app.limits.max-description-length:2000}")
    private int maxDescriptionLength;

    @Value("${app.limits.max-wallet-name-length:128}")
    private int maxWalletNameLength;

    @Value("${app.limits.max-scam-type-length:64}")
    private int maxScamTypeLength;

    private final WebClient goPlusClient;
    private final WebClient externalClient;
    private final ChainRepository chainRepository;
    private final ReportRepository reportRepository;

    public SecurityAggregatorService(WebClient.Builder builder,
                                     ChainRepository chainRepository,
                                     ReportRepository reportRepository) {
        this.goPlusClient = builder.clone().baseUrl("https://api.gopluslabs.io").build();
        this.externalClient = builder.clone().build();
        this.chainRepository = chainRepository;
        this.reportRepository = reportRepository;
    }

    @Cacheable(value = "walletChecks", key = "#target + '|' + #chainName", unless = "#result == null || #result.startsWith('❌')")
    public String checkAddress(String target, String chainName) {
        return buildTextReport(buildWalletCheckResponse(target, chainName));
    }

    @Cacheable(value = "walletCheckDetails", key = "#target + '|' + #chainName",
            unless = "#result == null || 'ERROR'.equals(#result.verdict)")
    public WalletCheckResponse checkAddressDetails(String target, String chainName) {
        return buildWalletCheckResponse(target, chainName);
    }

    public String checkUrl(String rawUrl) {
        String url = InputValidator.requireUrl(rawUrl);

        if (!StringUtils.hasText(vtKey)) {
            return "⚠️ Проверка ссылки недоступна: не задан VIRUSTOTAL_API_KEY.";
        }

        try {
            String urlId = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(url.getBytes(StandardCharsets.UTF_8));

            VirusTotalResponse response = externalClient.get()
                    .uri("https://www.virustotal.com/api/v3/urls/" + urlId)
                    .header("x-apikey", vtKey)
                    .retrieve()
                    .bodyToMono(VirusTotalResponse.class)
                    .timeout(EXTERNAL_CALL_TIMEOUT)
                    .block();

            if (response == null
                    || response.getData() == null
                    || response.getData().getAttributes() == null
                    || response.getData().getAttributes().getLast_analysis_stats() == null) {
                return "⚠️ Данные по ссылке не найдены.";
            }

            var stats = response.getData().getAttributes().getLast_analysis_stats();
            int malicious = stats.getOrDefault("malicious", 0);
            int suspicious = stats.getOrDefault("suspicious", 0);

            StringBuilder report = new StringBuilder();
            report.append("🌐 АНАЛИЗ ССЫЛКИ: ").append(url).append("\n");
            report.append("🛡️ Вердикт VirusTotal:\n");

            if (malicious > 0 || suspicious > 0) {
                report.append("❌ ОПАСНО! Обнаружена угроза!\n");
                report.append("- Вредоносных пометок: ").append(malicious).append("\n");
                report.append("- Подозрительных пометок: ").append(suspicious).append("\n");
                report.append("РЕКОМЕНДАЦИЯ: Не переходите по этой ссылке!");
            } else {
                report.append("✅ Ссылка выглядит безопасной (антивирусы не нашли угроз).\n");
            }
            return report.toString();
        } catch (Exception e) {
            return "❌ Ошибка при проверке ссылки.";
        }
    }

    @Caching(evict = {
            @CacheEvict(value = "walletChecks", allEntries = true),
            @CacheEvict(value = "walletCheckDetails", allEntries = true)
    })
    public boolean addReport(ReportRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("report is required");
        }
        WalletReport report = new WalletReport();
        report.setAddress(InputValidator.requireAddress(request.getAddress()));
        report.setScamType(InputValidator.requireNonBlank(
                InputValidator.limit(request.getScamType(), maxScamTypeLength), "scamType"));
        report.setWalletName(InputValidator.limit(request.getWalletName(), maxWalletNameLength));
        report.setDescription(InputValidator.limit(request.getDescription(), maxDescriptionLength));

        try {
            reportRepository.save(report);
            return true;
        } catch (DataAccessException ex) {
            return false;
        }
    }

    private WalletCheckResponse buildWalletCheckResponse(String target, String requestedChainName) {
        WalletCheckResponse response = new WalletCheckResponse();
        response.setTarget(target);
        response.setRequestedChainName(requestedChainName);
        response.setCheckedAt(OffsetDateTime.now(ZoneOffset.UTC).toString());

        response.getInternalReports().setSource("Внутренняя БД жалоб");
        response.getScorechain().setSource("Scorechain AML");
        response.getGoPlus().setSource("GoPlus");

        Chain chain = resolveChain(requestedChainName);
        if (chain == null) {
            response.setScore(0);
            response.setRiskLevel("UNKNOWN");
            response.setReviewRequired(true);
            response.setVerdict("ERROR");
            response.setVerdictSummary("Сеть не найдена в справочнике. Проверьте выбранную сеть и повторите запрос.");

            response.getBalance().setAvailable(false);
            response.getBalance().setDisplay("Недоступно");
            response.getBalance().setNote("Справочник сетей не смог определить chainId и symbol.");

            markUnavailable(response.getScorechain(), "Сеть не распознана, AML-проверка не выполнена.");
            markUnavailable(response.getGoPlus(), "Сеть не распознана, технический аудит не выполнен.");

            response.getInternalReports().setAvailable(true);
            response.getInternalReports().setStatus("ok");
            response.getInternalReports().setSummary("Проверка локальной базы не выполнена без валидной сети.");

            addSection(response, "Ошибка проверки", "error", response.getVerdictSummary(),
                    List.of("Запрошенная сеть: " + requestedChainName));
            return response;
        }

        response.setResolvedChainName(chain.getChainName());
        response.setChainId(chain.getChainId());
        response.setChainSymbol(chain.getChainSymbol());

        InternalReportsFetchResult internalReportsResult = fetchInternalReports(target);
        List<WalletReport> internalReports = internalReportsResult.reports();

        response.setBalance(getWalletBalance(target, chain));
        response.setInternalReports(buildInternalReportCheck(internalReportsResult));
        response.setScorechain(callScorechain(target, chain));
        response.setGoPlus(callGoPlus(target, chain));

        buildSignals(response, internalReports);
        finalizeVerdict(response);
        buildSections(response, internalReports);

        return response;
    }

    private void buildSignals(WalletCheckResponse response, List<WalletReport> internalReports) {
        if (response.getInternalReports().isFlagged()) {
            addSignal(response, "high",
                    "Адрес уже фигурирует в пользовательской базе жалоб: " + internalReports.size() + " записей.",
                    response.getInternalReports().getSource());
        }

        if (response.getScorechain().isFlagged()) {
            addSignal(response, "high",
                    "AML-провайдер обнаружил санкционный или рискованный статус адреса.",
                    response.getScorechain().getSource());
        }

        if (response.getGoPlus().isFlagged()) {
            for (String detail : response.getGoPlus().getDetails()) {
                String severity = detail.contains("Подозрительная") ? "medium" : "high";
                addSignal(response, severity, detail, response.getGoPlus().getSource());
            }
        }

        if (response.getSignals().isEmpty()) {
            if (hasMinimumCoverage(response)) {
                if (isFullyCovered(response)) {
                    addSignal(response, "low",
                            "По доступным источникам адрес не отмечен как опасный.",
                            "system");
                } else {
                    addSignal(response, "low",
                            "Явных сигналов риска по доступным источникам не найдено, но часть проверок недоступна.",
                            "system");
                }
            } else {
                addSignal(response, "medium",
                        "Недостаточно данных от внешних источников, автоматическую проверку нельзя считать полной.",
                        "system");
            }
        }
    }

    private void finalizeVerdict(WalletCheckResponse response) {
        boolean hasDanger = response.getInternalReports().isFlagged()
                || response.getScorechain().isFlagged()
                || response.getGoPlus().isFlagged();
        boolean hasMinimumCoverage = hasMinimumCoverage(response);
        boolean fullyCovered = isFullyCovered(response);

        int score = 100;

        if (response.getInternalReports().isFlagged()) {
            score -= 25 + Math.min(25, Math.max(0, response.getInternalReports().getDetails().size() * 8));
        }

        if (response.getScorechain().isFlagged()) {
            score -= 35;
        } else if (!response.getScorechain().isAvailable()) {
            score -= 12;
        }

        if (response.getGoPlus().isFlagged()) {
            score -= 20;
            for (String detail : response.getGoPlus().getDetails()) {
                if (detail.contains("Фишинг") || detail.contains("Киберпреступность")) {
                    score -= 15;
                } else {
                    score -= 8;
                }
            }
        } else if (!response.getGoPlus().isAvailable()) {
            score -= 18;
        }

        if (!response.getBalance().isAvailable()) {
            score -= 5;
        }

        if (!fullyCovered && hasMinimumCoverage && !hasDanger) {
            score = Math.min(score, 79);
        }

        score = Math.max(5, Math.min(100, score));
        response.setScore(score);

        if (score >= 80) {
            response.setRiskLevel("LOW");
        } else if (score >= 55) {
            response.setRiskLevel("MEDIUM");
        } else {
            response.setRiskLevel("HIGH");
        }

        if (hasDanger) {
            response.setDangerous(true);
            response.setVerdict("DANGEROUS");
            response.setVerdictSummary("Обнаружены прямые сигналы риска. Адрес нельзя считать безопасным.");
            return;
        }

        if (!hasMinimumCoverage) {
            response.setReviewRequired(true);
            response.setVerdict("REVIEW");
            response.setVerdictSummary("Ключевые внешние источники не ответили или не поддерживают эту сеть. Нужна ручная проверка.");
            return;
        }

        response.setSafe(true);
        response.setVerdict("SAFE");
        response.setVerdictSummary(fullyCovered
                ? "По всем доступным источникам явные сигналы риска не обнаружены."
                : "Явных сигналов риска по доступным источникам не обнаружено, но часть проверок временно недоступна.");
    }

    private boolean isFullyCovered(WalletCheckResponse response) {
        return response.getScorechain().isAvailable()
                && response.getGoPlus().isAvailable()
                && response.getInternalReports().isAvailable();
    }

    private boolean hasMinimumCoverage(WalletCheckResponse response) {
        return response.getInternalReports().isAvailable()
                && (response.getGoPlus().isAvailable() || response.getScorechain().isAvailable());
    }

    private void buildSections(WalletCheckResponse response, List<WalletReport> internalReports) {
        addSection(response,
                "Баланс кошелька",
                response.getBalance().isAvailable() ? "ok" : "warn",
                response.getBalance().getDisplay(),
                response.getBalance().getNote() == null
                        ? List.of("Нативный баланс определён по данным Moralis.")
                        : List.of(response.getBalance().getNote()));

        addSection(response,
                response.getInternalReports().getSource(),
                normalizeSectionStatus(response.getInternalReports().getStatus()),
                response.getInternalReports().getSummary(),
                response.getInternalReports().getDetails().isEmpty()
                        ? List.of("Жалоб по адресу не найдено.")
                        : response.getInternalReports().getDetails());

        addSection(response,
                response.getScorechain().getSource(),
                normalizeSectionStatus(response.getScorechain().getStatus()),
                response.getScorechain().getSummary(),
                response.getScorechain().getDetails().isEmpty()
                        ? List.of("AML-источник не вернул дополнительных деталей.")
                        : response.getScorechain().getDetails());

        addSection(response,
                response.getGoPlus().getSource(),
                normalizeSectionStatus(response.getGoPlus().getStatus()),
                response.getGoPlus().getSummary(),
                response.getGoPlus().getDetails().isEmpty()
                        ? List.of("Технический источник не вернул дополнительных деталей.")
                        : response.getGoPlus().getDetails());

        if (!internalReports.isEmpty()) {
            addSection(response,
                    "Что именно нашли в базе",
                    "danger",
                    "Ниже перечислены последние пользовательские репорты по этому адресу.",
                    response.getInternalReports().getDetails());
        }
    }

    private WalletCheckResponse.SourceCheck buildInternalReportCheck(InternalReportsFetchResult internalReportsResult) {
        WalletCheckResponse.SourceCheck source = new WalletCheckResponse.SourceCheck();
        source.setSource("Внутренняя БД жалоб");
        List<WalletReport> internalReports = internalReportsResult.reports();

        if (!internalReportsResult.available()) {
            source.setAvailable(false);
            source.setStatus("unavailable");
            source.setSummary("Локальная база жалоб временно недоступна.");
            source.getDetails().add("Таблица user_reports отсутствует или недоступна для чтения.");
            return source;
        }

        source.setAvailable(true);

        if (internalReports.isEmpty()) {
            source.setStatus("ok");
            source.setSummary("Жалоб по адресу в локальной базе не найдено.");
            return source;
        }

        source.setFlagged(true);
        source.setStatus("danger");
        source.setSummary("Найдено жалоб: " + internalReports.size());

        internalReports.stream()
                .limit(5)
                .map(this::formatInternalReportLine)
                .forEach(source.getDetails()::add);

        return source;
    }

    private InternalReportsFetchResult fetchInternalReports(String target) {
        try {
            return new InternalReportsFetchResult(
                    true,
                    reportRepository.findAllByAddressIgnoreCaseOrderByCreatedAtDesc(target)
            );
        } catch (DataAccessException ex) {
            return new InternalReportsFetchResult(false, List.of());
        }
    }

    private WalletCheckResponse.SourceCheck callScorechain(String target, Chain chain) {
        WalletCheckResponse.SourceCheck source = new WalletCheckResponse.SourceCheck();
        source.setSource("Scorechain AML");

        if (!StringUtils.hasText(scorechainKey)) {
            source.setSupported(false);
            source.setStatus("unsupported");
            source.setSummary("SCORECHAIN_API_KEY не задан, AML-проверка отключена.");
            return source;
        }

        String blockchain = resolveScorechainChainKey(chain);
        if (blockchain == null) {
            source.setSupported(false);
            source.setStatus("unsupported");
            source.setSummary("Для выбранной сети не настроен AML-ключ Scorechain.");
            return source;
        }

        try {
            ScorechainResponse aml = externalClient.get()
                    .uri("https://api.scorechain.com/v1/" + blockchain + "/addresses/" + target)
                    .header("X-API-KEY", scorechainKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(ScorechainResponse.class)
                    .timeout(EXTERNAL_CALL_TIMEOUT)
                    .block();

            if (aml == null) {
                markUnavailable(source, "AML-источник не вернул данные по адресу.");
                return source;
            }

            source.setAvailable(true);
            if (aml.isSanctioned()) {
                source.setFlagged(true);
                source.setStatus("danger");
                source.setSummary("Адрес помечен как санкционный или высокорисковый.");
                if (aml.getTags() != null && !aml.getTags().isEmpty()) {
                    source.getDetails().add("Метки: " + String.join(", ", aml.getTags()));
                }
            } else {
                source.setStatus("ok");
                source.setSummary("Санкционных ограничений по данным Scorechain не найдено.");
                if (aml.getTags() != null && !aml.getTags().isEmpty()) {
                    source.getDetails().add("Найдены вспомогательные метки: " + String.join(", ", aml.getTags()));
                }
            }

            return source;
        } catch (Exception e) {
            markUnavailable(source, "Данные AML временно недоступны.");
            source.getDetails().add("Источник Scorechain не ответил или вернул неожиданный формат.");
            return source;
        }
    }

    private WalletCheckResponse.SourceCheck callGoPlus(String target, Chain chain) {
        WalletCheckResponse.SourceCheck source = new WalletCheckResponse.SourceCheck();
        source.setSource("GoPlus");

        if (!supportsGoPlus(chain)) {
            source.setSupported(false);
            source.setStatus("unsupported");
            source.setSummary("GoPlus address security сейчас используется только для EVM-сетей.");
            return source;
        }

        try {
            GoPlusResponse goPlus = goPlusClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/address_security/" + target)
                            .queryParam("chain_id", chain.getChainId())
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(GoPlusResponse.class)
                    .timeout(EXTERNAL_CALL_TIMEOUT)
                    .block();

            Map<String, Object> result = asObjectMap(extractGoPlusResult(goPlus, target));
            if (result == null || result.isEmpty()) {
                markUnavailable(source, "GoPlus не вернул структурированные данные по адресу.");
                return source;
            }

            source.setAvailable(true);

            boolean phishing = isTruthy(result.get("phishing_activities"));
            boolean sanctioned = isTruthy(result.get("sanctioned"));
            boolean cybercrime = isTruthy(result.get("cybercrime"));
            boolean blacklist = isTruthy(result.get("blacklist_doubt"));

            if (phishing || sanctioned || cybercrime || blacklist) {
                source.setFlagged(true);
                source.setStatus("danger");
                source.setSummary("Найдены технические сигналы риска.");
                if (phishing) {
                    source.getDetails().add("Фишинговая активность");
                }
                if (sanctioned) {
                    source.getDetails().add("Санкционный признак в ответе GoPlus");
                }
                if (cybercrime) {
                    source.getDetails().add("Киберпреступная активность");
                }
                if (blacklist) {
                    source.getDetails().add("Подозрительная активность / blacklist");
                }
            } else {
                source.setStatus("ok");
                source.setSummary("Технических угроз по данным GoPlus не найдено.");
            }

            return source;
        } catch (Exception e) {
            markUnavailable(source, "GoPlus временно недоступен.");
            source.getDetails().add("Технический аудит не завершился из-за ошибки внешнего API.");
            return source;
        }
    }

    private WalletCheckResponse.BalanceInfo getWalletBalance(String target, Chain chain) {
        WalletCheckResponse.BalanceInfo balance = new WalletCheckResponse.BalanceInfo();
        balance.setSymbol(chain.getChainSymbol());

        if (!StringUtils.hasText(moralisKey)) {
            balance.setAvailable(false);
            balance.setDisplay("Недоступно");
            balance.setNote("MORALIS_API_KEY не задан, баланс через Moralis отключен.");
            return balance;
        }

        if (!supportsMoralisBalance(chain)) {
            balance.setAvailable(false);
            balance.setDisplay("Недоступно");
            balance.setNote("Автоматическое получение native-баланса пока настроено только для EVM-сетей.");
            return balance;
        }

        String moralisChain = resolveMoralisChainKey(chain);
        if (moralisChain == null) {
            balance.setAvailable(false);
            balance.setDisplay("Недоступно");
            balance.setNote("Не удалось сопоставить сеть с параметром Moralis.");
            return balance;
        }

        try {
            MoralisBalanceResponse response = externalClient.get()
                    .uri("https://deep-index.moralis.io/api/v2.2/" + target + "/balance?chain=" + moralisChain)
                    .header("X-API-Key", moralisKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(MoralisBalanceResponse.class)
                    .timeout(EXTERNAL_CALL_TIMEOUT)
                    .block();

            if (response == null || !StringUtils.hasText(response.getBalance())) {
                balance.setAvailable(false);
                balance.setDisplay("Недоступно");
                balance.setNote("Moralis не вернул баланс по адресу.");
                return balance;
            }

            BigDecimal rawBalance;
            try {
                rawBalance = new BigDecimal(response.getBalance().trim());
            } catch (NumberFormatException nfe) {
                balance.setAvailable(false);
                balance.setDisplay("Недоступно");
                balance.setNote("Moralis вернул некорректное значение баланса.");
                return balance;
            }

            BigDecimal divisor = BigDecimal.TEN.pow(resolveNativeDecimals(chain));
            BigDecimal normalized = rawBalance.divide(divisor, 8, RoundingMode.DOWN);
            String value = formatAmount(normalized);

            balance.setAvailable(true);
            balance.setValue(value);
            balance.setDisplay(value + " " + chain.getChainSymbol());
            return balance;
        } catch (Exception e) {
            balance.setAvailable(false);
            balance.setDisplay("Недоступно");
            balance.setNote("Не удалось получить баланс через Moralis.");
            return balance;
        }
    }

    Chain resolveChain(String chainName) {
        if (chainName == null || chainName.isBlank()) {
            return ChainCatalog.findBuiltin(chainName).orElse(null);
        }

        String normalizedQuery = ChainCatalog.normalizeQuery(chainName);
        String trimmedQuery = chainName.trim();

        try {
            List<Chain> byName = chainRepository.findByChainNameContainingIgnoreCase(normalizedQuery);
            Chain exact = findExactMatch(byName, normalizedQuery, trimmedQuery);
            if (exact != null) return exact;

            List<Chain> bySymbol = chainRepository.findByChainSymbolContainingIgnoreCase(trimmedQuery);
            exact = findExactMatch(bySymbol, normalizedQuery, trimmedQuery);
            if (exact != null) return exact;

            if (!byName.isEmpty()) return byName.get(0);
            if (!bySymbol.isEmpty()) return bySymbol.get(0);
        } catch (DataAccessException ex) {
            return ChainCatalog.findBuiltin(chainName).orElse(null);
        }

        return ChainCatalog.findBuiltin(chainName).orElse(null);
    }

    private Chain findExactMatch(List<Chain> candidates, String normalizedName, String rawQuery) {
        String normLc = normalizedName == null ? "" : normalizedName.toLowerCase(Locale.ROOT);
        String rawLc = rawQuery == null ? "" : rawQuery.toLowerCase(Locale.ROOT);
        for (Chain c : candidates) {
            String name = safeLower(c.getChainName());
            String sym = safeLower(c.getChainSymbol());
            if (name.equals(normLc) || name.equals(rawLc) || sym.equals(rawLc)) {
                return c;
            }
        }
        return null;
    }

    private String resolveScorechainChainKey(Chain chain) {
        String name = safeLower(chain.getChainName());
        String symbol = safeLower(chain.getChainSymbol());

        if (name.contains("ethereum") || "eth".equals(symbol)) {
            return "ethereum";
        }
        if (name.contains("bnb") || name.contains("binance") || "bnb".equals(symbol)) {
            return "bsc";
        }
        if (name.contains("polygon") || "matic".equals(symbol) || "pol".equals(symbol)) {
            return "polygon";
        }
        if (name.contains("solana") || "sol".equals(symbol)) {
            return "solana";
        }
        return null;
    }

    private String resolveMoralisChainKey(Chain chain) {
        String name = safeLower(chain.getChainName());
        String symbol = safeLower(chain.getChainSymbol());

        if (name.contains("ethereum") || "eth".equals(symbol)) {
            return "eth";
        }
        if (name.contains("bnb") || name.contains("binance") || "bnb".equals(symbol)) {
            return "bsc";
        }
        if (name.contains("polygon") || "matic".equals(symbol) || "pol".equals(symbol)) {
            return "polygon";
        }
        return null;
    }

    boolean supportsGoPlus(Chain chain) {
        if (chain == null) return false;
        String providerType = safeLower(chain.getProviderType());
        String name = safeLower(chain.getChainName());
        if (providerType.contains("evm")) return true;
        // Fallback: known EVM names even if providerType is blank
        return name.contains("ethereum") || name.contains("bnb") || name.contains("binance")
                || name.contains("polygon");
    }

    private boolean supportsMoralisBalance(Chain chain) {
        return resolveMoralisChainKey(chain) != null;
    }

    private int resolveNativeDecimals(Chain chain) {
        String name = safeLower(chain.getChainName());
        if (name.contains("solana")) {
            return 9;
        }
        return 18;
    }

    private Object extractGoPlusResult(GoPlusResponse response, String target) {
        if (response == null || response.getResult() == null) {
            return null;
        }

        Object result = response.getResult();
        Map<String, Object> resultMap = asObjectMap(result);
        if (resultMap == null) {
            return result;
        }

        if (resultMap.containsKey("phishing_activities")
                || resultMap.containsKey("cybercrime")
                || resultMap.containsKey("blacklist_doubt")) {
            return resultMap;
        }

        Object byOriginalTarget = resultMap.get(target);
        if (byOriginalTarget != null) {
            return byOriginalTarget;
        }

        Object byLowerTarget = resultMap.get(target.toLowerCase(Locale.ROOT));
        if (byLowerTarget != null) {
            return byLowerTarget;
        }

        return resultMap.values().stream().findFirst().orElse(null);
    }

    private Map<String, Object> asObjectMap(Object value) {
        if (value instanceof Map<?, ?> mapValue) {
            Map<String, Object> normalized = new LinkedHashMap<>();
            mapValue.forEach((key, mapEntryValue) -> normalized.put(String.valueOf(key), mapEntryValue));
            return normalized;
        }
        return null;
    }

    private boolean isTruthy(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean boolValue) {
            return boolValue;
        }
        if (value instanceof Number numberValue) {
            return numberValue.intValue() == 1;
        }
        String stringValue = String.valueOf(value);
        return "1".equals(stringValue) || "true".equalsIgnoreCase(stringValue) || "yes".equalsIgnoreCase(stringValue);
    }

    private void addSignal(WalletCheckResponse response, String severity, String text, String source) {
        WalletCheckResponse.RiskSignal signal = new WalletCheckResponse.RiskSignal();
        signal.setSeverity(severity);
        signal.setText(text);
        signal.setSource(source);
        response.getSignals().add(signal);
    }

    private void addSection(WalletCheckResponse response,
                            String title,
                            String status,
                            String summary,
                            List<String> details) {
        WalletCheckResponse.ReportSection section = new WalletCheckResponse.ReportSection();
        section.setTitle(title);
        section.setStatus(status);
        section.setSummary(summary);
        if (details != null) {
            section.getDetails().addAll(details);
        }
        response.getSections().add(section);
    }

    private String buildTextReport(WalletCheckResponse response) {
        StringBuilder report = new StringBuilder();
        report.append("🔍 ПОЛНЫЙ АУДИТ КОШЕЛЬКА: ").append(response.getTarget()).append("\n");
        report.append("🌐 Сеть: ").append(nullSafe(response.getResolvedChainName(), "Не определена")).append("\n");
        report.append("💰 Текущий баланс: ")
                .append(nullSafe(response.getBalance().getDisplay(), "Недоступно"))
                .append("\n");
        report.append("----------------------------------\n");

        appendTextSection(report, response.getInternalReports());
        appendTextSection(report, response.getScorechain());
        appendTextSection(report, response.getGoPlus());

        if (!response.getSignals().isEmpty()) {
            report.append("📌 СИГНАЛЫ РИСКА:\n");
            response.getSignals().forEach(signal ->
                    report.append("- [")
                            .append(signal.getSeverity().toUpperCase(Locale.ROOT))
                            .append("] ")
                            .append(signal.getText())
                            .append("\n"));
            report.append("----------------------------------\n");
        }

        report.append("📢 ВЕРДИКТ: ");
        switch (response.getVerdict()) {
            case "DANGEROUS" -> report.append("⛔️ ОПАСНО");
            case "REVIEW" -> report.append("🟡 ТРЕБУЕТ РУЧНОЙ ПРОВЕРКИ");
            case "SAFE" -> report.append("🟢 БЕЗОПАСНО");
            default -> report.append("❌ ОШИБКА ПРОВЕРКИ");
        }
        report.append("\n");
        report.append("📊 Security Score: ").append(response.getScore()).append("/100").append("\n");
        report.append("🧭 Риск: ").append(mapRiskLevel(response.getRiskLevel())).append("\n");
        report.append("🕒 Проверено: ")
                .append(formatCheckedAt(response.getCheckedAt()))
                .append("\n");
        report.append("📝 ").append(response.getVerdictSummary());

        return report.toString();
    }

    private String formatCheckedAt(String iso) {
        if (iso == null || iso.isBlank()) return "—";
        try {
            return REPORT_TIME_FORMAT.format(OffsetDateTime.parse(iso));
        } catch (DateTimeParseException ex) {
            return iso;
        }
    }

    private void appendTextSection(StringBuilder report, WalletCheckResponse.SourceCheck source) {
        report.append("• ").append(source.getSource()).append(": ").append(nullSafe(source.getSummary(), "Нет данных")).append("\n");
        for (String detail : source.getDetails()) {
            report.append("  - ").append(detail).append("\n");
        }
        report.append("----------------------------------\n");
    }

    private void markUnavailable(WalletCheckResponse.SourceCheck source, String summary) {
        source.setAvailable(false);
        source.setStatus("unavailable");
        source.setSummary(summary);
    }

    private String formatInternalReportLine(WalletReport report) {
        List<String> parts = new ArrayList<>();
        if (report.getCreatedAt() != null) {
            parts.add(REPORT_TIME_FORMAT.format(report.getCreatedAt().atOffset(ZoneOffset.UTC)));
        }
        if (report.getScamType() != null && !report.getScamType().isBlank()) {
            parts.add(report.getScamType());
        }
        if (report.getWalletName() != null && !report.getWalletName().isBlank()) {
            parts.add(report.getWalletName());
        }

        String prefix = String.join(" · ", parts);
        if (report.getDescription() == null || report.getDescription().isBlank()) {
            return prefix;
        }
        if (prefix.isBlank()) {
            return truncate(report.getDescription(), 180);
        }
        return prefix + " — " + truncate(report.getDescription(), 180);
    }

    private String formatAmount(BigDecimal value) {
        BigDecimal stripped = value.stripTrailingZeros();
        if (stripped.scale() < 0) {
            stripped = stripped.setScale(0, RoundingMode.DOWN);
        }
        if (stripped.scale() > 4) {
            stripped = stripped.setScale(4, RoundingMode.DOWN).stripTrailingZeros();
        }
        return stripped.toPlainString();
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength - 1) + "…";
    }

    private String mapRiskLevel(String riskLevel) {
        return switch (riskLevel == null ? "" : riskLevel) {
            case "LOW" -> "Низкий";
            case "MEDIUM" -> "Средний";
            case "HIGH" -> "Высокий";
            default -> "Не определён";
        };
    }

    private String normalizeSectionStatus(String status) {
        return switch (status == null ? "" : status) {
            case "danger" -> "danger";
            case "unsupported", "unavailable" -> "warn";
            case "ok" -> "ok";
            default -> "neutral";
        };
    }

    private String nullSafe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    private record InternalReportsFetchResult(boolean available, List<WalletReport> reports) {
    }
}
