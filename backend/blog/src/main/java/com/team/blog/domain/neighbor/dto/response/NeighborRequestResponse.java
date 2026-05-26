package com.team.blog.domain.neighbor.dto.response;

import com.team.blog.domain.neighbor.entity.Neighbor;
import com.team.blog.domain.user.entity.UserEntity;

import java.time.LocalDateTime;

/** 받은 이웃 신청 응답 DTO */
public record NeighborRequestResponse(
        Long id,
        Long fromUserId,
        String nickname,
        String profileImg,
        LocalDateTime createdAt
) {
    public static NeighborRequestResponse of(Neighbor neighbor, UserEntity userEntity) {
        return new NeighborRequestResponse(
                neighbor.getId(),
                neighbor.getFromUserId(),
                userEntity.getNickname(),
                userEntity.getProfileImg(),
                neighbor.getCreatedAt()
        );
    }
}