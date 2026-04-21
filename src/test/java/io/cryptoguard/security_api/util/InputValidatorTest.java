package io.cryptoguard.security_api.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class InputValidatorTest {

    @Test
    void requireAddress_trimsAndReturns() {
        assertEquals("0xabc123", InputValidator.requireAddress("  0xabc123  "));
    }

    @Test
    void requireAddress_rejectsBlank() {
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireAddress(""));
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireAddress("   "));
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireAddress(null));
    }

    @Test
    void requireAddress_rejectsTooLong() {
        String tooLong = "0x" + "a".repeat(200);
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireAddress(tooLong));
    }

    @Test
    void requireAddress_rejectsInvalidChars() {
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireAddress("0xabc; DROP TABLE"));
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireAddress("<script>"));
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireAddress("0x\nabc"));
    }

    @Test
    void requireChainName_acceptsCommonNames() {
        assertEquals("Ethereum", InputValidator.requireChainName("Ethereum"));
        assertEquals("BNB Chain", InputValidator.requireChainName("BNB Chain"));
        assertEquals("polygon-pos", InputValidator.requireChainName("polygon-pos"));
    }

    @Test
    void requireChainName_rejectsInvalid() {
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireChainName(""));
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireChainName("<script>"));
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireChainName("a".repeat(100)));
    }

    @Test
    void requireUrl_acceptsHttpAndHttps() {
        assertEquals("https://example.com", InputValidator.requireUrl("https://example.com"));
        assertEquals("http://example.com/path?q=1", InputValidator.requireUrl("http://example.com/path?q=1"));
    }

    @Test
    void requireUrl_rejectsNonHttp() {
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireUrl("javascript:alert(1)"));
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireUrl("ftp://x"));
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireUrl("example.com"));
    }

    @Test
    void requireUrl_rejectsWhitespaceAndBadChars() {
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireUrl("https://exa mple.com"));
        assertThrows(IllegalArgumentException.class, () -> InputValidator.requireUrl("https://exa\nmple.com"));
    }

    @Test
    void limit_truncatesAndTrims() {
        assertEquals("abcd", InputValidator.limit("  abcdef  ", 4));
        assertEquals("abc", InputValidator.limit("abc", 10));
        assertNull(InputValidator.limit(null, 10));
    }
}
