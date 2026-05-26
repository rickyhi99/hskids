package com.team.blog.domain.neighbor.dto.response;

import com.team.blog.domain.user.entity.UserEntity;

/** 이웃 유저 정보 응답 DTO (목록/삭제) */
public record NeighborUserResponse(
        Long id,
        Long userId,
        String nickname,
        String profileImg
) {
    public static NeighborUserResponse of(Long neighborId, UserEntity userEntity) {
        return new NeighborUserResponse(
                neighborId,
                userEntity.getId(),
                userEntity.getNickname(),
                userEntity.getProfileImg()
        );
    }
}