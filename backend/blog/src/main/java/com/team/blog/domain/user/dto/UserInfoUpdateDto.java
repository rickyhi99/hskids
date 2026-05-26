package com.team.blog.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserInfoUpdateDto {
    private String currentPwd;
    private String newPwd;
    private String nickname;
}
