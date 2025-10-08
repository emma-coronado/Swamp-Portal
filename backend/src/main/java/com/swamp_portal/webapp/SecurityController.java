package com.swamp_portal.webapp;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityController {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())   // will be a no-op in prod if no CORS bean
                .authorizeHttpRequests(auth -> auth
                        // allow static SPA assets + shell
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                        .requestMatchers(HttpMethod.GET, "/", "/index.html", "/favicon.ico",
                                "/*.js", "/*.css", "/assets/**", "/3rdpartylicenses.txt").permitAll()
                        // open auth endpoints (if you have them)
                        .requestMatchers("/api/auth/**").permitAll()
                        // keep everything public for hackathon
                        .anyRequest().permitAll()
                );
        return http.build();
    }

    // ---- CORS for local dev only (so ng serve can hit the backend) ----
    @Bean
    @Profile("local")
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type","Accept"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Content-Type","Cache-Control","Connection","Transfer-Encoding"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
