package io.cryptoguard.security_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS-конфиг.
 *
 * Используется allowedOriginPatterns (а не allowedOrigins), чтобы поддерживать
 * шаблоны вида https://*.duckdns.org и wildcard "*". allowedOrigins строгий и
 * не матчит поддомены — для прод-деплоев за reverse proxy этого обычно мало.
 *
 * Список берётся из app.cors.allowed-origin-patterns (см. application.yml),
 * который в свою очередь тянется из env CORS_ALLOWED_ORIGINS. Это позволяет
 * менять список разрешённых доменов без пересборки образа.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origin-patterns:}")
    private String allowedOriginPatterns;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] patterns = (allowedOriginPatterns == null || allowedOriginPatterns.isBlank())
                ? new String[]{
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://*.duckdns.org"
                }
                : allowedOriginPatterns.split("\\s*,\\s*");

        registry.addMapping("/api/**")
                .allowedOriginPatterns(patterns)
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
