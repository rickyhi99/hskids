package com.team.blog.domain.user.dto;

import com.team.blog.domain.user.entity.UserEntity;
import lombok.Getter;

@Getter
public class UserMeResponse {
    private final Long id;
    private final String loginId;
    private final String nickname;
    private final String email;

    public UserMeResponse(UserEntity user) {
        this.id = user.getId();
        this.loginId = user.getLoginId();
        this.nickname = user.getNickname();
        this.email = user.getEmail();
    }
}
