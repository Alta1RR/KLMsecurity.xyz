package io.cryptoguard.security_api.util;

import java.util.regex.Pattern;

/**
 * Basic input sanitization/validation. Throws IllegalArgumentException for rejects —
 * GlobalExceptionHandler turns those into HTTP 400.
 */
public final class InputValidator {

    // Very loose address pattern: 0x + hex (EVM) OR base58-ish (Solana/BTC).
    // We do NOT want to over-constrain here — just reject obvious junk.
    private static final Pattern ADDRESS_PATTERN = Pattern.compile("^[a-zA-Z0-9_:\\-]{3,128}$");
    private static final Pattern CHAIN_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9 ._\\-]{1,64}$");
    private static final Pattern URL_PATTERN = Pattern.compile("^https?://[^\\s<>\"'\\\\]{3,2048}$", Pattern.CASE_INSENSITIVE);

    private InputValidator() {
    }

    public static String requireAddress(String value) {
        String trimmed = requireNonBlank(value, "target");
        if (trimmed.length() > 128) {
            throw new IllegalArgumentException("target is too long");
        }
        if (!ADDRESS_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("target has invalid format");
        }
        return trimmed;
    }

    public static String requireChainName(String value) {
        String trimmed = requireNonBlank(value, "chainName");
        if (trimmed.length() > 64) {
            throw new IllegalArgumentException("chainName is too long");
        }
        if (!CHAIN_NAME_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("chainName has invalid format");
        }
        return trimmed;
    }

    public static String requireUrl(String value) {
        String trimmed = requireNonBlank(value, "url");
        if (trimmed.length() > 2048) {
            throw new IllegalArgumentException("url is too long");
        }
        if (!URL_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("url must start with http(s):// and contain no whitespace");
        }
        return trimmed;
    }

    public static String requireSearchQuery(String value) {
        String trimmed = requireNonBlank(value, "name");
        if (trimmed.length() > 64) {
            throw new IllegalArgumentException("name is too long");
        }
        return trimmed;
    }

    public static String requireNonBlank(String value, String field) {
        if (value == null) {
            throw new IllegalArgumentException(field + " is required");
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return trimmed;
    }

    public static String limit(String value, int max) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.length() > max ? trimmed.substring(0, max) : trimmed;
    }
}
