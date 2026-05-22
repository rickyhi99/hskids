package com.team.blog.domain.user.service;

import com.team.blog.domain.user.dto.UserJoinRequestDto;
import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import com.team.blog.global.api.ErrorCode;
import com.team.blog.global.exception.ApiException;
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
            throw new ApiException(ErrorCode.USER_DUPLICATED_ID);
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ApiException(ErrorCode.USER_DUPLICATED_EMAIL);
        }
        if (userRepository.existsByNickname(dto.getNickname())) {
            throw new ApiException(ErrorCode.USER_DUPLICATED_NICKNAME);
        }

        UserEntity user = UserEntity.builder()
                .loginId(dto.getId())
                .password(passwordEncoder.encode(dto.getPassword()))
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
