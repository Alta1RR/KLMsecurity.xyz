package io.cryptoguard.security_api.controller;

import io.cryptoguard.security_api.dto.ReportRequest;
import io.cryptoguard.security_api.dto.WalletCheckResponse;
import io.cryptoguard.security_api.service.SecurityAggregatorService;
import io.cryptoguard.security_api.util.InputValidator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Контроллер безопасности.
 * Обрабатывает запросы на проверку крипто-адресов, URL-ссылок
 * и прием пользовательских жалоб.
 *
 * Все пользовательские входы предварительно санитизируются через {@link InputValidator}
 * (длина, формат, обязательность полей), чтобы защитить БД и внешние API от мусора.
 */
@RestController
@RequestMapping("/api/v1")
public class SecurityController {

    private final SecurityAggregatorService aggregator;

    public SecurityController(SecurityAggregatorService aggregator) {
        this.aggregator = aggregator;
    }

    // --- БЛОК ПРОВЕРОК (ЧТЕНИЕ) ---

    /**
     * Комплексная проверка крипто-кошелька.
     * Анализирует баланс (Moralis), технические угрозы (GoPlus),
     * санкции (Scorechain) и наличие в локальной базе репортов.
     *
     * @param target    Адрес кошелька (например, 0x...)
     * @param chainName Название сети для поиска ID в справочнике
     * @return Текстовый отчет с вердиктом безопасности
     */
    @GetMapping("/check")
    public String check(@RequestParam String target, @RequestParam String chainName) {
        String safeTarget = InputValidator.requireAddress(target);
        String safeChain = InputValidator.requireChainName(chainName);
        return aggregator.checkAddress(safeTarget, safeChain);
    }

    /**
     * Структурированная версия комплексной проверки для фронтенда.
     * Возвращает JSON с балансом, статусами источников, сигналами риска и итоговым вердиктом.
     *
     * @param target    Адрес кошелька
     * @param chainName Название сети для поиска ID в справочнике
     * @return Полный структурированный отчет
     */
    @GetMapping("/check/details")
    public WalletCheckResponse checkDetails(@RequestParam String target, @RequestParam String chainName) {
        String safeTarget = InputValidator.requireAddress(target);
        String safeChain = InputValidator.requireChainName(chainName);
        return aggregator.checkAddressDetails(safeTarget, safeChain);
    }

    /**
     * Проверка URL-ссылки на фишинг и вредоносное ПО.
     * Использует API VirusTotal для анализа безопасности Web2.
     *
     * @param url Полная ссылка для анализа
     * @return Статистика антивирусных срабатываний и рекомендация
     */
    @GetMapping("/check-url")
    public String checkUrl(@RequestParam String url) {
        String safeUrl = InputValidator.requireUrl(url);
        return aggregator.checkUrl(safeUrl);
    }

    // --- БЛОК ВЗАИМОДЕЙСТВИЯ С СООБЩЕСТВОМ (ЗАПИСЬ) ---

    /**
     * Прием новой жалобы на мошенничество от пользователя.
     * Данные сохраняются в базу данных после валидации входа
     * (длина, обязательные поля, формат адреса).
     *
     * Вход принимается через отдельный DTO {@link ReportRequest},
     * чтобы клиент не мог подменить id/createdAt у сущности.
     *
     * @param request Объект жалобы (адрес, тип скама, имя кошелька, описание)
     * @return JSON со статусом обработки
     */
    @PostMapping("/report")
    public ResponseEntity<Map<String, String>> submitReport(@RequestBody(required = false) ReportRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("report body is required");
        }
        boolean saved = aggregator.addReport(request);
        if (!saved) {
            // Локальная БД недоступна — не врём клиенту «принято».
            return ResponseEntity.status(503).body(Map.of(
                    "status", "error",
                    "message", "Жалоба не сохранена: локальная база недоступна."
            ));
        }
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "Жалоба принята и добавлена в базу."
        ));
    }
}
