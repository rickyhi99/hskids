package com.team.blog.domain.neighbor.dto.response;

/** 두 유저 사이의 이웃 관계 상태 응답 DTO */
public record NeighborStatusResponse(
        String status,      // NONE | PENDING_SENT | PENDING_RECEIVED | ACCEPTED
        Long neighborId     // 관계 row id (NONE이면 null)
) {}
