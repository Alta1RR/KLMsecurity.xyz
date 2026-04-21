package io.cryptoguard.security_api;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Минимальный smoke-тест: проверяем, что класс приложения присутствует и доступен.
 * Полноценный @SpringBootTest с поднятием контекста требует живой БД (Postgres),
 * поэтому он вынесен за рамки юнит-тестов. Контроллеры и сервис покрываются
 * отдельно через MockMvc/Mockito.
 */
class SecurityApiApplicationTests {

    @Test
    void applicationClassIsAvailable() {
        assertNotNull(SecurityApiApplication.class);
    }
}
