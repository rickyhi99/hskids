package com.team.blog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()
                .anyRequest().permitAll()
            )
            .csrf(csrf -> csrf.disable())
                // from 방식 로그인, http basic 인증 disable
                .formLogin((auth) -> auth.disable())
                .httpBasic((auth) -> auth.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        // 경로별 인가 작업
        http
            .authorizeHttpRequests((auth) -> auth
                    // 1. 비회원도 접근 가능한 '오픈 구간' (로그인, 메인, 회원가입, H2 콘솔(개발 기간에만))
                    .requestMatchers("/", "/login", "/join", "/h2-console/**").permitAll()

                    // 2. 그 외의 나머지 모든 주소는 '로그인한 회원만' 접근 가능
                    .anyRequest().authenticated());

        // 세션을 무상태로 만든다
        http
            .sessionManagement((session) -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }
}
