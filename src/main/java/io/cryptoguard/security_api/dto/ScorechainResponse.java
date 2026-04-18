package io.cryptoguard.security_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ScorechainResponse {
    private boolean sanctioned;
    private List<String> tags;
}