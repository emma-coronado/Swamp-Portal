package com.swamp_portal.webapp.controllers;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class Pulse {

    @RequestMapping("/")
    public String home() {
        return "Heartbeat";
    }
}
