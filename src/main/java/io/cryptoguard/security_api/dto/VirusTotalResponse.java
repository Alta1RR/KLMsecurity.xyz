package io.cryptoguard.security_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class VirusTotalResponse {
    private DataBlock data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DataBlock {
        private Attributes attributes;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Attributes {
        private Map<String, Integer> last_analysis_stats;
    }
}