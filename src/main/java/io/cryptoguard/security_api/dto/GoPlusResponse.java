package io.cryptoguard.security_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoPlusResponse {
    private int code;
    private String message;
    private Object result;
}
