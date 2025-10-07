package com.swamp_portal.webapp;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.servlet.http.*;

import org.springframework.stereotype.Service;

@Service
public class SessionService {
    private static final String COOKIE_NAME = "SESSION";
    private final Map<String,String> sessions = new ConcurrentHashMap<>();
    // token -> username

    public void createSession(HttpServletResponse res, String username) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, username);

        Cookie c = new Cookie(COOKIE_NAME, token);
        c.setHttpOnly(true);
        c.setPath("/");
        // setSecure(true) in prod behind HTTPS
        res.addCookie(c);
    }

    public String getUser(HttpServletRequest req) {
        if (req.getCookies() == null) return null;
        for (Cookie c : req.getCookies()) {
            if (COOKIE_NAME.equals(c.getName())) {
                return sessions.get(c.getValue());
            }
        }
        return null;
    }

    public void logout(HttpServletRequest req, HttpServletResponse res) {
        if (req.getCookies() == null) return;
        for (Cookie c : req.getCookies()) {
            if (COOKIE_NAME.equals(c.getName())) {
                sessions.remove(c.getValue());
                c.setMaxAge(0);
                c.setPath("/");
                res.addCookie(c);
            }
        }
    }
}
