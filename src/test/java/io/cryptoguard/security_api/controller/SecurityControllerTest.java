package io.cryptoguard.security_api.controller;

import io.cryptoguard.security_api.config.GlobalExceptionHandler;
import io.cryptoguard.security_api.dto.ReportRequest;
import io.cryptoguard.security_api.dto.WalletCheckResponse;
import io.cryptoguard.security_api.service.SecurityAggregatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SecurityControllerTest {

    private SecurityAggregatorService aggregator;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        aggregator = mock(SecurityAggregatorService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new SecurityController(aggregator))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void check_missingParam_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/check").param("target", "0xabc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void check_invalidAddress_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/check")
                        .param("target", "<script>")
                        .param("chainName", "ethereum"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("invalid_input"));
        verifyNoInteractions(aggregator);
    }

    @Test
    void check_validInput_delegatesToService() throws Exception {
        when(aggregator.checkAddress(anyString(), anyString())).thenReturn("OK-REPORT");

        mockMvc.perform(get("/api/v1/check")
                        .param("target", "0xabc123")
                        .param("chainName", "ethereum"))
                .andExpect(status().isOk())
                .andExpect(content().string("OK-REPORT"));

        verify(aggregator).checkAddress("0xabc123", "ethereum");
    }

    @Test
    void checkDetails_returnsJson() throws Exception {
        WalletCheckResponse resp = new WalletCheckResponse();
        resp.setVerdict("SAFE");
        resp.setScore(95);
        when(aggregator.checkAddressDetails(anyString(), anyString())).thenReturn(resp);

        mockMvc.perform(get("/api/v1/check/details")
                        .param("target", "0xabc123")
                        .param("chainName", "ethereum"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verdict").value("SAFE"))
                .andExpect(jsonPath("$.score").value(95));
    }

    @Test
    void checkUrl_rejectsNonHttp() throws Exception {
        mockMvc.perform(get("/api/v1/check-url").param("url", "javascript:alert(1)"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(aggregator);
    }

    private static String toJson(ReportRequest r) {
        java.util.List<String> parts = new java.util.ArrayList<>();
        if (r.getAddress() != null) parts.add(field("address", r.getAddress()));
        if (r.getWalletName() != null) parts.add(field("walletName", r.getWalletName()));
        if (r.getScamType() != null) parts.add(field("scamType", r.getScamType()));
        if (r.getDescription() != null) parts.add(field("description", r.getDescription()));
        return "{" + String.join(",", parts) + "}";
    }

    private static String field(String name, String value) {
        String escaped = value.replace("\\", "\\\\").replace("\"", "\\\"");
        return "\"" + name + "\":\"" + escaped + "\"";
    }

    @Test
    void submitReport_ok() throws Exception {
        ReportRequest req = new ReportRequest();
        req.setAddress("0xabc123");
        req.setScamType("phishing");
        req.setDescription("fake swap");

        when(aggregator.addReport(any(ReportRequest.class))).thenReturn(true);

        mockMvc.perform(post("/api/v1/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void submitReport_dbUnavailable_returns503() throws Exception {
        ReportRequest req = new ReportRequest();
        req.setAddress("0xabc123");
        req.setScamType("phishing");

        when(aggregator.addReport(any(ReportRequest.class))).thenReturn(false);

        mockMvc.perform(post("/api/v1/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(req)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    void submitReport_emptyBody_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/report")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitReport_invalidAddressPropagatedFromService() throws Exception {
        ReportRequest req = new ReportRequest();
        req.setAddress("");
        req.setScamType("phishing");

        when(aggregator.addReport(any(ReportRequest.class)))
                .thenThrow(new IllegalArgumentException("address is required"));

        mockMvc.perform(post("/api/v1/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("invalid_input"));
    }
}
