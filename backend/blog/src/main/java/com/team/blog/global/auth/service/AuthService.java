package com.team.blog.global.auth.service;

import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import com.team.blog.global.auth.dto.LoginRequestDto;
import com.team.blog.global.auth.dto.TokenResponseDto;
import com.team.blog.global.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public TokenResponseDto login(LoginRequestDto dto) {
        UserEntity user = userRepository.findByLoginId(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다."));

        if (!passwordEncoder.matches(dto.getPwd(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다.");
        }

        return TokenResponseDto.builder()
                .accessToken(jwtUtil.createAccessToken(user.getLoginId(), user.getRole()))
                .refreshToken(jwtUtil.createRefreshToken(user.getLoginId()))
                .build();
    }

    public TokenResponseDto refresh(String refreshToken) {
        if (!jwtUtil.isValid(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        String loginId = jwtUtil.getUserId(refreshToken);
        UserEntity user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return TokenResponseDto.builder()
                .accessToken(jwtUtil.createAccessToken(user.getLoginId(), user.getRole()))
                .refreshToken(jwtUtil.createRefreshToken(user.getLoginId()))
                .build();
    }
}
