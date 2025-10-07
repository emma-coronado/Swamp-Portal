package com.swamp_portal.webapp;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityController {
    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        // No login form, no basic auth; we’ll guard endpoints ourselves.
        http.csrf(AbstractHttpConfigurer::disable);
        http.cors(Customizer.withDefaults());
        http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
