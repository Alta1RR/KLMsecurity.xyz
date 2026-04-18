package io.cryptoguard.security_api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WalletCheckResponse {

    private String target;
    private String requestedChainName;
    private String resolvedChainName;
    private String chainId;
    private String chainSymbol;
    private String checkedAt;

    private boolean safe;
    private boolean dangerous;
    private boolean reviewRequired;

    private int score;
    private String riskLevel;
    private String verdict;
    private String verdictSummary;

    private BalanceInfo balance = new BalanceInfo();
    private SourceCheck internalReports = new SourceCheck();
    private SourceCheck scorechain = new SourceCheck();
    private SourceCheck goPlus = new SourceCheck();

    private List<RiskSignal> signals = new ArrayList<>();
    private List<ReportSection> sections = new ArrayList<>();

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class BalanceInfo {
        private boolean available;
        private String display;
        private String value;
        private String symbol;
        private String note;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SourceCheck {
        private String source;
        private boolean supported = true;
        private boolean available;
        private boolean flagged;
        private String status;
        private String summary;
        private List<String> details = new ArrayList<>();
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RiskSignal {
        private String severity;
        private String text;
        private String source;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ReportSection {
        private String title;
        private String status;
        private String summary;
        private List<String> details = new ArrayList<>();
    }
}
