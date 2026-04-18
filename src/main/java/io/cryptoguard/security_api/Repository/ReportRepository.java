package io.cryptoguard.security_api.Repository;

import io.cryptoguard.security_api.model.WalletReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<WalletReport, Long> {
    // Поиск всех жалоб на конкретный адрес
    List<WalletReport> findAllByAddressIgnoreCase(String address);
    List<WalletReport> findAllByAddressIgnoreCaseOrderByCreatedAtDesc(String address);
}
