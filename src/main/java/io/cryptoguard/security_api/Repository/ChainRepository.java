package io.cryptoguard.security_api.Repository;

import io.cryptoguard.security_api.model.Chain;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChainRepository extends JpaRepository<Chain, Long> {
    List<Chain> findByChainNameContainingIgnoreCase(String chainName);
    List<Chain> findByChainSymbolContainingIgnoreCase(String chainSymbol);
}
