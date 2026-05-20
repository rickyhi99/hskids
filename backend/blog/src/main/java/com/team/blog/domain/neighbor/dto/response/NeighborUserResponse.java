package com.team.blog.domain.neighbor.dto.response;

import com.team.blog.domain.user.entity.User;

/** 이웃 유저 정보 응답 DTO (목록/삭제) */
public record NeighborUserResponse(
        Long id,
        Long userId,
        String nickname,
        String profileImg
) {
    public static NeighborUserResponse of(Long neighborId, User user) {
        return new NeighborUserResponse(
                neighborId,
                user.getId(),
                user.getNickname(),
                user.getProfileImg()
        );
    }
}