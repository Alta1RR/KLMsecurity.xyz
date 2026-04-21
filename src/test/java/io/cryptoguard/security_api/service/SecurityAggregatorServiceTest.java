package io.cryptoguard.security_api.service;

import io.cryptoguard.security_api.Repository.ChainRepository;
import io.cryptoguard.security_api.Repository.ReportRepository;
import io.cryptoguard.security_api.dto.ReportRequest;
import io.cryptoguard.security_api.dto.WalletCheckResponse;
import io.cryptoguard.security_api.model.Chain;
import io.cryptoguard.security_api.model.WalletReport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class SecurityAggregatorServiceTest {

    private ChainRepository chainRepository;
    private ReportRepository reportRepository;
    private SecurityAggregatorService service;

    @BeforeEach
    void setUp() {
        chainRepository = mock(ChainRepository.class);
        reportRepository = mock(ReportRepository.class);

        // WebClient.Builder — важно, сервис делает builder.clone().baseUrl(...).build()
        WebClient.Builder builder = WebClient.builder();
        service = new SecurityAggregatorService(builder, chainRepository, reportRepository);

        ReflectionTestUtils.setField(service, "moralisKey", "");
        ReflectionTestUtils.setField(service, "scorechainKey", "");
        ReflectionTestUtils.setField(service, "vtKey", "");
        ReflectionTestUtils.setField(service, "maxDescriptionLength", 2000);
        ReflectionTestUtils.setField(service, "maxWalletNameLength", 128);
        ReflectionTestUtils.setField(service, "maxScamTypeLength", 64);
    }

    @Test
    void checkAddressDetails_unknownChain_returnsErrorVerdict() {
        when(chainRepository.findByChainNameContainingIgnoreCase(anyString())).thenReturn(List.of());
        when(chainRepository.findByChainSymbolContainingIgnoreCase(anyString())).thenReturn(List.of());

        WalletCheckResponse resp = service.checkAddressDetails("0xabc", "completely-unknown-chain");
        assertEquals("ERROR", resp.getVerdict());
        assertTrue(resp.isReviewRequired());
    }

    @Test
    void checkAddressDetails_dbDown_fallsBackToBuiltins() {
        when(chainRepository.findByChainNameContainingIgnoreCase(anyString()))
                .thenThrow(new DataAccessResourceFailureException("db down"));
        when(reportRepository.findAllByAddressIgnoreCaseOrderByCreatedAtDesc(anyString()))
                .thenThrow(new DataAccessResourceFailureException("db down"));

        WalletCheckResponse resp = service.checkAddressDetails("0xabc", "ethereum");
        assertNotNull(resp.getResolvedChainName());
        assertEquals("Ethereum", resp.getResolvedChainName());
        // Внутренние репорты помечены как недоступные, но сервис не падает.
        assertFalse(resp.getInternalReports().isAvailable());
    }

    @Test
    void resolveChain_picksExactMatchOverPrefixMatch() {
        Chain etherlink = newChain("Etherlink", "42793", "XTZ", "evm");
        Chain ethereum = newChain("Ethereum", "1", "ETH", "evm");
        when(chainRepository.findByChainNameContainingIgnoreCase(anyString()))
                .thenReturn(List.of(etherlink, ethereum));

        Chain resolved = service.resolveChain("Ethereum");
        assertEquals("Ethereum", resolved.getChainName(),
                "resolveChain должен выбрать точное совпадение, а не первый элемент списка");
    }

    @Test
    void supportsGoPlus_trueForEvm_falseForSolana() {
        assertTrue(service.supportsGoPlus(newChain("Ethereum", "1", "ETH", "evm")));
        assertTrue(service.supportsGoPlus(newChain("BNB Chain", "56", "BNB", "evm")));
        assertFalse(service.supportsGoPlus(newChain("Solana", "solana", "SOL", "solana")));
        assertFalse(service.supportsGoPlus(null));
        // Неизвестная non-EVM сеть: раньше было true (баг), теперь false.
        assertFalse(service.supportsGoPlus(newChain("Unknown", "xxx", "UNK", "")));
    }

    @Test
    void addReport_rejectsBlankAddress() {
        ReportRequest r = new ReportRequest();
        r.setAddress("   ");
        r.setScamType("phishing");
        assertThrows(IllegalArgumentException.class, () -> service.addReport(r));
        verifyNoInteractions(reportRepository);
    }

    @Test
    void addReport_rejectsBlankScamType() {
        ReportRequest r = new ReportRequest();
        r.setAddress("0xabc123");
        r.setScamType("");
        assertThrows(IllegalArgumentException.class, () -> service.addReport(r));
    }

    @Test
    void addReport_truncatesDescription() {
        ReportRequest r = new ReportRequest();
        r.setAddress("0xabc123");
        r.setScamType("phishing");
        r.setDescription("x".repeat(5000));

        when(reportRepository.save(any(WalletReport.class))).thenAnswer(inv -> inv.getArgument(0));

        assertTrue(service.addReport(r));
        verify(reportRepository).save(argThat(wr ->
                wr.getDescription() != null && wr.getDescription().length() <= 2000
        ));
    }

    @Test
    void addReport_returnsFalseOnDbError() {
        ReportRequest r = new ReportRequest();
        r.setAddress("0xabc123");
        r.setScamType("phishing");
        when(reportRepository.save(any(WalletReport.class)))
                .thenThrow(new DataAccessResourceFailureException("db down"));
        assertFalse(service.addReport(r));
    }

    @Test
    void addReport_nullRequestRejected() {
        assertThrows(IllegalArgumentException.class, () -> service.addReport(null));
    }

    @Test
    void checkUrl_noKey_returnsDisabledMessage() {
        String result = service.checkUrl("https://example.com");
        assertTrue(result.contains("VIRUSTOTAL_API_KEY"));
    }

    private Chain newChain(String name, String id, String symbol, String providerType) {
        Chain c = new Chain();
        c.setChainName(name);
        c.setChainId(id);
        c.setChainSymbol(symbol);
        c.setProviderType(providerType);
        return c;
    }
}
