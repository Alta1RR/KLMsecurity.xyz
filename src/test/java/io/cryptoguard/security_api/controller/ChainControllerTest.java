package io.cryptoguard.security_api.controller;

import io.cryptoguard.security_api.Repository.ChainRepository;
import io.cryptoguard.security_api.config.GlobalExceptionHandler;
import io.cryptoguard.security_api.model.Chain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ChainControllerTest {

    private ChainRepository chainRepository;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        chainRepository = mock(ChainRepository.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ChainController(chainRepository))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void search_mergesDbAndBuiltins() throws Exception {
        Chain dbEth = new Chain();
        dbEth.setChainName("Ethereum");
        dbEth.setChainId("1");
        dbEth.setChainSymbol("ETH");
        dbEth.setProviderType("evm");

        when(chainRepository.findByChainNameContainingIgnoreCase(anyString())).thenReturn(List.of(dbEth));
        when(chainRepository.findByChainSymbolContainingIgnoreCase(anyString())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/chains/search").param("name", "eth"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].chainName").value("Ethereum"));
    }

    @Test
    void search_dbDown_stillReturnsBuiltins() throws Exception {
        when(chainRepository.findByChainNameContainingIgnoreCase(anyString()))
                .thenThrow(new DataAccessResourceFailureException("db down"));
        when(chainRepository.findByChainSymbolContainingIgnoreCase(anyString()))
                .thenThrow(new DataAccessResourceFailureException("db down"));

        mockMvc.perform(get("/api/v1/chains/search").param("name", "ethereum"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].chainName").value("Ethereum"));
    }

    @Test
    void search_blankName_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/chains/search").param("name", "  "))
                .andExpect(status().isBadRequest());
    }

    @Test
    void search_tooLongName_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/chains/search").param("name", "x".repeat(200)))
                .andExpect(status().isBadRequest());
    }
}
