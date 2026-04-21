package io.cryptoguard.security_api.controller;

import io.cryptoguard.security_api.Repository.ChainRepository;
import io.cryptoguard.security_api.model.Chain;
import io.cryptoguard.security_api.service.ChainCatalog;
import io.cryptoguard.security_api.util.InputValidator;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Контроллер для работы со справочником блокчейн-сетей.
 * Предоставляет API для поиска информации о сетях (Chain ID, Symbol) в локальной БД
 * с фоллбэком на встроенный каталог {@link ChainCatalog}.
 *
 * Защиты от дурака:
 *  - длина запроса ограничена {@link InputValidator#requireSearchQuery(String)};
 *  - при недоступности БД (DataAccessException) результат строится только из builtins,
 *    чтобы поиск продолжал работать.
 */
@RestController
@RequestMapping("/api/v1/chains")
public class ChainController {

    // Максимум результатов, чтобы запрос не превращался в dump всей таблицы.
    private static final int MAX_RESULTS = 20;

    // Слой доступа к данным (репозиторий)
    private final ChainRepository chainRepository;

    /**
     * Внедрение зависимостей через конструктор.
     */
    public ChainController(ChainRepository chainRepository) {
        this.chainRepository = chainRepository;
    }

    /**
     * Поиск сетей по частичному совпадению названия ИЛИ символа.
     * Используется фронтендом для автозаполнения и получения точного Chain ID по имени.
     *
     * Результаты из БД объединяются с builtins (ChainCatalog) — приоритет у БД,
     * уникальность по нормализованному chainName.
     */
    @GetMapping("/search")
    public List<Chain> searchChains(@RequestParam String name) {
        String query = InputValidator.requireSearchQuery(name);

        List<Chain> byName = new ArrayList<>();
        List<Chain> bySymbol = new ArrayList<>();
        try {
            byName = chainRepository.findByChainNameContainingIgnoreCase(query);
            bySymbol = chainRepository.findByChainSymbolContainingIgnoreCase(query);
        } catch (DataAccessException ex) {
            // БД недоступна — не падаем, отдадим хотя бы builtins ниже.
            byName = List.of();
            bySymbol = List.of();
        }

        List<Chain> builtinChains = ChainCatalog.searchBuiltins(query);
        Map<String, Chain> merged = new LinkedHashMap<>();

        // Порядок: сначала матчи БД по имени, потом по символу, потом builtins.
        for (Chain chain : byName) {
            merged.putIfAbsent(key(chain), chain);
        }
        for (Chain chain : bySymbol) {
            merged.putIfAbsent(key(chain), chain);
        }
        for (Chain chain : builtinChains) {
            merged.putIfAbsent(key(chain), chain);
        }

        return merged.values().stream()
                .limit(MAX_RESULTS)
                .toList();
    }

    private String key(Chain chain) {
        String name = chain.getChainName() == null ? "" : chain.getChainName().toLowerCase(Locale.ROOT);
        String id = chain.getChainId() == null ? "" : chain.getChainId();
        return name + "|" + id;
    }
}
