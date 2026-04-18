package io.cryptoguard.security_api.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.jpa.repository.EntityGraph;

@Entity
@Table(name = "chains")
@Data
public class Chain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chain_name")
    private String chainName;

    @Column(name = "chain_id")
    private String chainId;

    @Column(name = "chain_symbol")
    private String chainSymbol;

    @Column(name = "provider_type")
    private String providerType;
}