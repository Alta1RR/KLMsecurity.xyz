package io.cryptoguard.security_api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Very simple per-IP sliding-window rate limiter.
 * Not distributed, not persistent — sufficient as a basic DoS guard.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int WINDOW_MS = 60_000;
    private static final int MAX_REQUESTS_PER_WINDOW = 60;

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path == null || !path.startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        String ip = clientIp(request);
        long now = System.currentTimeMillis();
        Window w = windows.compute(ip, (k, existing) -> {
            if (existing == null || now - existing.start > WINDOW_MS) {
                return new Window(now);
            }
            return existing;
        });

        int count = w.counter.incrementAndGet();
        if (count > MAX_REQUESTS_PER_WINDOW) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"rate_limit_exceeded\"}");
            return;
        }

        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().start > WINDOW_MS);
        }

        chain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return (comma > 0 ? xff.substring(0, comma) : xff).trim();
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }

    private static final class Window {
        final long start;
        final AtomicInteger counter = new AtomicInteger(0);

        Window(long start) {
            this.start = start;
        }
    }
}
