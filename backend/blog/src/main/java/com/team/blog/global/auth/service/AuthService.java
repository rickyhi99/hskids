package com.team.blog.global.auth.service;

import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import com.team.blog.global.api.ErrorCode;
import com.team.blog.global.auth.dto.LoginRequestDto;
import com.team.blog.global.auth.dto.TokenResponseDto;
import com.team.blog.global.exception.ApiException;
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
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_MISMATCH));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new ApiException(ErrorCode.AUTH_MISMATCH);
        }

        return TokenResponseDto.builder()
                .accessToken(jwtUtil.createAccessToken(user.getLoginId(), user.getRole()))
                .refreshToken(jwtUtil.createRefreshToken(user.getLoginId()))
                .build();
    }

    public TokenResponseDto refresh(String refreshToken) {
        if (!jwtUtil.isValid(refreshToken)) {
            throw new ApiException(ErrorCode.AUTH_INVALID_TOKEN);
        }

        String loginId = jwtUtil.getUserId(refreshToken);
        UserEntity user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        return TokenResponseDto.builder()
                .accessToken(jwtUtil.createAccessToken(user.getLoginId(), user.getRole()))
                .refreshToken(jwtUtil.createRefreshToken(user.getLoginId()))
                .build();
    }
}
