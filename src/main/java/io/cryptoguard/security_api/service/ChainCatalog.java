package io.cryptoguard.security_api.service;

import io.cryptoguard.security_api.model.Chain;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

public final class ChainCatalog {

    private static final Map<String, Chain> BUILTIN_CHAINS = Map.of(
            "ethereum", chain("Ethereum", "1", "ETH", "evm"),
            "bnb", chain("BNB Chain", "56", "BNB", "evm"),
            "polygon", chain("Polygon", "137", "MATIC", "evm"),
            "solana", chain("Solana", "solana", "SOL", "solana")
    );

    private static final Map<String, String> ALIASES = Map.ofEntries(
            Map.entry("auto", "ethereum"),
            Map.entry("eth", "ethereum"),
            Map.entry("ethereum", "ethereum"),
            Map.entry("ethereum mainnet", "ethereum"),
            Map.entry("bnb", "bnb"),
            Map.entry("bsc", "bnb"),
            Map.entry("bnb chain", "bnb"),
            Map.entry("binance smart chain", "bnb"),
            Map.entry("polygon", "polygon"),
            Map.entry("matic", "polygon"),
            Map.entry("polygon pos", "polygon"),
            Map.entry("sol", "solana"),
            Map.entry("solana", "solana"),
            Map.entry("solana mainnet", "solana")
    );

    private ChainCatalog() {
    }

    public static Optional<Chain> findBuiltin(String query) {
        String key = canonicalKey(query);
        if (key == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(BUILTIN_CHAINS.get(key)).map(ChainCatalog::copy);
    }

    public static List<Chain> searchBuiltins(String query) {
        String normalized = normalize(query);
        return BUILTIN_CHAINS.values().stream()
                .filter(chain -> normalized == null
                        || containsIgnoreCase(chain.getChainName(), normalized)
                        || containsIgnoreCase(chain.getChainSymbol(), normalized)
                        || containsIgnoreCase(chain.getProviderType(), normalized))
                .map(ChainCatalog::copy)
                .toList();
    }

    public static String normalizeQuery(String query) {
        String key = canonicalKey(query);
        if (key == null) {
            return query == null ? null : query.trim();
        }
        Chain chain = BUILTIN_CHAINS.get(key);
        return chain == null ? query : chain.getChainName();
    }

    private static String canonicalKey(String query) {
        String normalized = normalize(query);
        if (normalized == null || normalized.isBlank()) {
            return "ethereum";
        }
        return ALIASES.getOrDefault(normalized, normalized);
    }

    private static String normalize(String query) {
        if (query == null) {
            return null;
        }
        return query.trim().toLowerCase(Locale.ROOT);
    }

    private static boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private static Chain chain(String name, String id, String symbol, String providerType) {
        Chain chain = new Chain();
        chain.setChainName(name);
        chain.setChainId(id);
        chain.setChainSymbol(symbol);
        chain.setProviderType(providerType);
        return chain;
    }

    private static Chain copy(Chain source) {
        Chain chain = new Chain();
        chain.setId(source.getId());
        chain.setChainName(source.getChainName());
        chain.setChainId(source.getChainId());
        chain.setChainSymbol(source.getChainSymbol());
        chain.setProviderType(source.getProviderType());
        return chain;
    }
}
