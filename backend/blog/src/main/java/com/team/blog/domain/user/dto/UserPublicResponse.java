package com.team.blog.domain.user.dto;

import com.team.blog.domain.user.entity.UserEntity;
import lombok.Getter;

@Getter
public class UserPublicResponse {
    private final Long id;
    private final String nickname;
    private final String profileImg;

    public UserPublicResponse(UserEntity user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.profileImg = user.getProfileImg();
    }
}
