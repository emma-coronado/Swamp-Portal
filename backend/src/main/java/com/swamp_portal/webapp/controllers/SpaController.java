package com.swamp_portal.webapp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    @RequestMapping("/")
    public String root() { return "forward:/index.html"; }

    // one segment, e.g., /dashboard
    @RequestMapping("/{p:[^\\.]+}")
    public String level1() { return "forward:/index.html"; }

    // two segments, e.g., /mission/42
    @RequestMapping("/{p1:[^\\.]+}/{p2:[^\\.]+}")
    public String level2() { return "forward:/index.html"; }

    // add more levels if your routes go deeper
}
