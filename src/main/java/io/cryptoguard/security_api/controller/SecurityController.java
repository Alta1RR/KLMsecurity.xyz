package io.cryptoguard.security_api.controller;

import io.cryptoguard.security_api.dto.WalletCheckResponse;
import io.cryptoguard.security_api.model.WalletReport;
import io.cryptoguard.security_api.service.SecurityAggregatorService;
import org.springframework.web.bind.annotation.*;

/**
 * Контроллер безопасности.
 * Обрабатывает запросы на проверку крипто-адресов, URL-ссылок
 * и прием пользовательских жалоб
 */
@RestController
@RequestMapping("/api/v1")
public class SecurityController {

    private final SecurityAggregatorService goPlusService;

    public SecurityController(SecurityAggregatorService goPlusService) {
        this.goPlusService = goPlusService;
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
        return goPlusService.checkAddress(target, chainName);
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
        return goPlusService.checkAddressDetails(target, chainName);
    }

    /**
     * Проверка URL-ссылки на фишинг и вредоносное ПО
     * Использует API VirusTotal для анализа безопасности Web2
     *
     * @param url Полная ссылка для анализа
     * @return Статистика антивирусных срабатываний и рекомендация
     */
    @GetMapping("/check-url")
    public String checkUrl(@RequestParam String url) {
        return goPlusService.checkUrl(url);
    }

    // --- БЛОК ВЗАИМОДЕЙСТВИЯ С СООБЩЕСТВОМ (ЗАПИСЬ) ---

    /**
     * Прием новой жалобы на мошенничество от пользователя
     * Данные сохраняются в базу данных
     *
     * @param report Объект жалобы, содержащий адрес, тип скама и описание
     * @return Подтверждение успешного добавления в базу
     */
    @PostMapping("/report")
    public String submitReport(@RequestBody WalletReport report) {
        boolean saved = goPlusService.addReport(report);
        if (!saved) {
            return "⚠️ Жалоба не сохранена: локальная база user_reports недоступна или не создана.";
        }
        return "✅ Ваша жалоба на адрес " + report.getAddress() + " успешно принята и добавлена в базу.";
    }
}
