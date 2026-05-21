package com.team.blog.domain.user.service;

import com.team.blog.domain.user.dto.UserJoinRequestDto;
import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public void join(UserJoinRequestDto dto) {
        if (userRepository.existsByLoginId(dto.getId())) {
            throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
        }

        UserEntity user = UserEntity.builder()
                .loginId(dto.getId())
                .password(passwordEncoder.encode(dto.getPwd()))
                .email(dto.getEmail())
                .nickname(dto.getNickname())
                .build();

        userRepository.save(user);
    }

    public boolean existsById(String id) {
        return userRepository.existsByLoginId(id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
