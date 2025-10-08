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
                // API-style app; CSRF off is fine here
                .csrf(csrf -> csrf.disable())

                // Enable CORS (uses the bean below)
                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth
                        // ===== allow the SPA shell & static assets =====
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/",
                                "/index.html",
                                "/favicon.ico",
                                "/*.js",
                                "/*.css",
                                "/assets/**",
                                "/3rdpartylicenses.txt"
                        ).permitAll()

                        // ===== open auth endpoints if you have any like /api/auth/** =====
                        .requestMatchers("/api/auth/**").permitAll()

                        // ===== for hackathon simplicity, leave everything else open =====
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    /**
     * CORS for both prod and local so <script type="module" crossorigin>
     * requests for main-*.js / polyfills-*.js aren't blocked.
     *
     * If you want to tighten later, replace AllowedOriginPatterns("*")
     * with explicit origins (e.g., your App Runner/custom domain).
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Permissive: allow any origin. (Do not use credentials with "*")
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowCredentials(false);

        // Allow common methods/headers
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        // Helpful for streaming/long responses (optional)
        config.setExposedHeaders(List.of("Content-Type","Cache-Control","Connection","Transfer-Encoding"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
