package com.swamp_portal.webapp.controllers;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
public class Pulse {

//    @RequestMapping("/")
//    public String home() {
//        return "Heartbeat";
//    }

    @RequestMapping("/time")
    public String time() {
        return String.valueOf(Instant.now().toEpochMilli());
    }
}
