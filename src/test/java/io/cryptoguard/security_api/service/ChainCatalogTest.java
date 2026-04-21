package io.cryptoguard.security_api.service;

import io.cryptoguard.security_api.model.Chain;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ChainCatalogTest {

    @Test
    void findBuiltin_resolvesAliasesToCanonical() {
        assertEquals("Ethereum", ChainCatalog.findBuiltin("eth").orElseThrow().getChainName());
        assertEquals("Ethereum", ChainCatalog.findBuiltin("ETHEREUM").orElseThrow().getChainName());
        assertEquals("BNB Chain", ChainCatalog.findBuiltin("bsc").orElseThrow().getChainName());
        assertEquals("Polygon", ChainCatalog.findBuiltin("matic").orElseThrow().getChainName());
        assertEquals("Solana", ChainCatalog.findBuiltin("sol").orElseThrow().getChainName());
    }

    @Test
    void findBuiltin_blankQueryDefaultsToEthereum() {
        assertEquals("Ethereum", ChainCatalog.findBuiltin("").orElseThrow().getChainName());
        assertEquals("Ethereum", ChainCatalog.findBuiltin(null).orElseThrow().getChainName());
    }

    @Test
    void findBuiltin_unknownReturnsEmpty() {
        Optional<Chain> result = ChainCatalog.findBuiltin("nonexistent-chain-xyz");
        assertTrue(result.isEmpty());
    }

    @Test
    void searchBuiltins_findsBySymbol() {
        assertFalse(ChainCatalog.searchBuiltins("BNB").isEmpty());
        assertFalse(ChainCatalog.searchBuiltins("sol").isEmpty());
    }

    @Test
    void searchBuiltins_returnsDefensiveCopies() {
        Chain c1 = ChainCatalog.findBuiltin("eth").orElseThrow();
        c1.setChainName("HACKED");
        Chain c2 = ChainCatalog.findBuiltin("eth").orElseThrow();
        assertEquals("Ethereum", c2.getChainName(),
                "ChainCatalog должен возвращать копии, чтобы мутация не ломала builtin-реестр");
    }

    @Test
    void normalizeQuery_returnsCanonicalChainName() {
        assertEquals("Ethereum", ChainCatalog.normalizeQuery("eth"));
        assertEquals("BNB Chain", ChainCatalog.normalizeQuery("bsc"));
    }
}
