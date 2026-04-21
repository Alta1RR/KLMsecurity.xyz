package io.cryptoguard.security_api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * JPA-сущность блокчейн-сети.
 *
 * Используем @Getter/@Setter/@ToString вместо @Data, чтобы не получить
 * автогенерённый equals/hashCode на всех полях (включая id) —
 * это классическая JPA-ловушка: два неперсистированных объекта (id=null)
 * считались бы равными, а у объектов в коллекциях Hibernate ломается поведение.
 */
@Entity
@Table(name = "chains")
@Getter
@Setter
@ToString
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
