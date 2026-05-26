package com.team.blog.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserPwdUpdateDto {
    private String id;
    private String email;
    private String newPwd;
}
