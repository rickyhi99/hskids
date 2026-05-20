package com.team.blog.service;

import com.team.blog.auth.JwtUtil;
import com.team.blog.dto.LoginRequestDto;
import com.team.blog.dto.TokenResponseDto;
import com.team.blog.repo.UserRepo;
import com.team.blog.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder;

    public TokenResponseDto login(LoginRequestDto dto) {
        User user = userRepo.findByLoginId(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다."));

        if (!encoder.matches(dto.getPwd(), user.getPwd())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다.");
        }

        return TokenResponseDto.builder()
                .accessToken(jwtUtil.createAccessToken(user.getLoginId(), user.getRole()))
                .refreshToken(jwtUtil.createRefreshToken(user.getLoginId()))
                .build();
    }
}
