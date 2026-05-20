package com.team.blog.domain.neighbor.dto.response;

import com.team.blog.domain.neighbor.entity.Neighbor;
import com.team.blog.domain.neighbor.entity.NeighborStatus;

import java.time.LocalDateTime;

/** 이웃 관계 상세 응답 DTO (신청/수락/거절) */
public record NeighborDetailResponse(
        Long id,
        Long fromUserId,
        Long toUserId,
        NeighborStatus status,
        LocalDateTime createdAt
) {
    public static NeighborDetailResponse from(Neighbor neighbor) {
        return new NeighborDetailResponse(
                neighbor.getId(),
                neighbor.getFromUserId(),
                neighbor.getToUserId(),
                neighbor.getStatus(),
                neighbor.getCreatedAt()
        );
    }

    /** 거절 응답 생성 — row 삭제 전 상태를 REJECTED로 반환 */
    public static NeighborDetailResponse rejected(Neighbor neighbor) {
        return new NeighborDetailResponse(
                neighbor.getId(),
                neighbor.getFromUserId(),
                neighbor.getToUserId(),
                NeighborStatus.REJECTED,
                neighbor.getCreatedAt()
        );
    }
}