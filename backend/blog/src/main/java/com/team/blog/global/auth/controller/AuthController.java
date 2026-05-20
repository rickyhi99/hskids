package com.team.blog.controller;

import com.team.blog.dto.LoginRequestDto;
import com.team.blog.dto.TokenResponseDto;
import com.team.blog.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 로그인 → JWT 발급
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    // 로그아웃 (JWT는 stateless라 클라이언트에서 토큰 삭제가 본질)
    // Refresh Token DB 저장 방식 쓰면 여기서 삭제 처리
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}