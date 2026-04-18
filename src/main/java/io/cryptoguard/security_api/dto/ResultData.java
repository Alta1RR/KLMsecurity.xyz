package io.cryptoguard.security_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ResultData {
    @JsonProperty("phishing_activities")
    private String phishingActivities;
    @JsonProperty("cybercrime")
    private String cyberCrime;
    @JsonProperty("sanctioned")
    private String sanctioned;
    @JsonProperty("blacklist_doubt")
    private String blacklistDoubt;
}

