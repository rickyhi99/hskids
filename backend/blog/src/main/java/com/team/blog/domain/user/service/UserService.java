package com.team.blog.domain.user.service;

import com.team.blog.domain.user.dto.UserInfoUpdateDto;
import com.team.blog.domain.user.dto.UserJoinRequestDto;
import com.team.blog.domain.user.dto.UserPwdUpdateDto;
import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import com.team.blog.global.api.ErrorCode;
import com.team.blog.global.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public boolean existsByNickname(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    @Transactional
    public void updatePassword(UserPwdUpdateDto dto) {
        UserEntity user = userRepository.findByLoginId(dto.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        if (!user.getEmail().equals(dto.getEmail())) {
            throw new ApiException(ErrorCode.AUTH_MISMATCH);
        }
        if (passwordEncoder.matches(dto.getNewPwd(), user.getPassword())) {
            throw new ApiException(ErrorCode.USER_PASSWORD_SAME);
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPwd()));
    }

    @Transactional
    public void updateInfo(String loginId, UserInfoUpdateDto dto) {
        UserEntity user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(dto.getCurrentPwd(), user.getPassword())) {
            throw new ApiException(ErrorCode.AUTH_MISMATCH);
        }

        if (dto.getNewPwd() != null) {
            if (passwordEncoder.matches(dto.getNewPwd(), user.getPassword())) {
                throw new ApiException(ErrorCode.USER_PASSWORD_SAME);
            }
            user.setPassword(passwordEncoder.encode(dto.getNewPwd()));
        }

        if (dto.getNickname() != null && !dto.getNickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(dto.getNickname())) {
                throw new ApiException(ErrorCode.USER_DUPLICATED_NICKNAME);
            }
            user.setNickname(dto.getNickname());
        }
    }

    @Transactional
    public void updateProfileImg(String loginId, String profileImg) {
        UserEntity user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        user.setProfileImg(profileImg);
    }

    @Transactional
    public void withdraw(String loginId) {
        UserEntity user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }

    public UserEntity findByLoginId(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    public UserEntity findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }
}
