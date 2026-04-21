package io.cryptoguard.security_api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * JPA-сущность пользовательской жалобы.
 *
 * Важно: вход от клиента приходит через отдельный DTO {@link io.cryptoguard.security_api.dto.ReportRequest},
 * а не напрямую в эту сущность — иначе клиент мог бы подменить id/createdAt.
 * Индекс по address ускоряет поиск по кошельку.
 */
@Entity
@Table(
        name = "user_reports",
        indexes = {
                @Index(name = "idx_user_reports_address", columnList = "address"),
                @Index(name = "idx_user_reports_created_at", columnList = "createdAt")
        }
)
@Getter
@Setter
@ToString
public class WalletReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 128)
    private String address;

    @Column(length = 128)
    private String walletName;

    @Column(nullable = false, length = 64)
    private String scamType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
