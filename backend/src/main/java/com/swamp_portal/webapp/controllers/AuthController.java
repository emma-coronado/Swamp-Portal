package com.swamp_portal.webapp.controllers;

import com.swamp_portal.webapp.AdminGuard;
import com.swamp_portal.webapp.SessionService;
import com.swamp_portal.webapp.db.UserRepo;
import jakarta.servlet.http.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final UserRepo users;
    private final SessionService sessions;
    private final AdminGuard admin;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(12);

    public AuthController(UserRepo users, SessionService sessions, AdminGuard admin) {
        this.users = users;
        this.sessions = sessions;
        this.admin = admin;
    }

    public static record SignupReq(String username, String password) {}
    public static record LoginReq(String username, String password) {}
    public static record Ok(String status) {}

    // Admin-only: create user
    @PostMapping("/signup")
    public Ok signup(@RequestBody SignupReq req, HttpServletRequest httpReq) {
        admin.requireAdmin(httpReq);
        if (req.username() == null || req.username().isBlank() ||
                req.password() == null || req.password().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid username/password");
        }
        String hash = bcrypt.encode(req.password());
        boolean created = users.createUser(req.username(), hash);
        if (!created) throw new ResponseStatusException(HttpStatus.CONFLICT, "Username taken");
        return new Ok("created");
    }

    // Anyone: login -> sets HttpOnly cookie if ok
    @PostMapping("/login")
    public Ok login(@RequestBody LoginReq req, HttpServletResponse res) {
        var item = users.get(req.username());
        if (item == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        if (!bcrypt.matches(req.password(), item.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        sessions.createSession(res, req.username());
        return new Ok("ok");
    }

    @PostMapping("/logout")
    public Ok logout(HttpServletRequest req, HttpServletResponse res) {
        sessions.logout(req, res);
        return new Ok("ok");
    }
}
