package io.cryptoguard.security_api.dto;

import lombok.Data;

/**
 * Input DTO for POST /api/v1/report.
 * Separated from the WalletReport entity so that clients cannot set id/createdAt.
 */
@Data
public class ReportRequest {
    private String address;
    private String walletName;
    private String scamType;
    private String description;
}
