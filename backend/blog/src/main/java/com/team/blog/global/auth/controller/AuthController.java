package com.team.blog.global.auth.controller;

import com.team.blog.global.auth.dto.LoginRequestDto;
import com.team.blog.global.auth.dto.TokenResponseDto;
import com.team.blog.global.auth.service.AuthService;
import com.team.blog.global.api.ApiResponse;
import com.team.blog.global.api.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    // 공통 ApiResponse 형식 반환

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponseDto>> login(@RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(dto)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // JWT는 stateless — 클라이언트가 토큰 삭제하면 됨
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponseDto>> refresh(@RequestHeader("Authorization") String bearer) {
        String refreshToken = bearer.replace("Bearer ", "");
        return ResponseEntity.ok(ApiResponse.success(authService.refresh(refreshToken)));
    }
}
