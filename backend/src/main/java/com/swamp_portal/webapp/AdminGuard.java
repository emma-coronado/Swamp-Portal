package com.swamp_portal.webapp;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AdminGuard {
    @Value("${ADMIN_PASSWORD:}")
    private String adminSecret;

    public void requireAdmin(HttpServletRequest req) {
        String header = req.getHeader("X-Admin-Secret");
        if (adminSecret == null || adminSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Admin secret not configured");
        }
        if (header == null || !header.equals(adminSecret)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin password required");
        }
    }
}
