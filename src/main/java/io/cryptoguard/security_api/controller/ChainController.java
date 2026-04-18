package io.cryptoguard.security_api.controller;

import io.cryptoguard.security_api.Repository.ChainRepository;
import io.cryptoguard.security_api.model.Chain;
import io.cryptoguard.security_api.service.ChainCatalog;
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
 * Контроллер для работы со справочником блокчейн-сетей
 * Предоставляет API для поиска информации о сетях (Chain ID, Symbol) в локальной базе данных
 */
@RestController
@RequestMapping("/api/v1/chains")
public class ChainController {

    // Слой доступа к данным (репозиторий)
    private final ChainRepository chainRepository;

    /**
     * Внедрение зависимостей через конструктор
     */
    public ChainController(ChainRepository chainRepository) {
        this.chainRepository = chainRepository;
    }

    /**
     * Поиск сетей по частичному совпадению названия
     * Используется фронтендом для автозаполнения и получения точного Chain ID по имени
     */
    @GetMapping("/search")
    public List<Chain> searchChains(@RequestParam String name) {
        List<Chain> dbChains = new ArrayList<>();
        try {
            dbChains = chainRepository.findByChainNameContainingIgnoreCase(name);
            if (dbChains.isEmpty()) {
                dbChains = chainRepository.findByChainSymbolContainingIgnoreCase(name);
            }
        } catch (DataAccessException ex) {
            dbChains = List.of();
        }

        List<Chain> builtinChains = ChainCatalog.searchBuiltins(name);
        Map<String, Chain> merged = new LinkedHashMap<>();

        for (Chain chain : dbChains) {
            merged.put(chain.getChainName().toLowerCase(Locale.ROOT), chain);
        }
        for (Chain chain : builtinChains) {
            merged.putIfAbsent(chain.getChainName().toLowerCase(Locale.ROOT), chain);
        }

        return new ArrayList<>(merged.values());
    }
}
