package com.team.blog.domain.neighbor.dto.request;

import com.team.blog.domain.neighbor.entity.NeighborStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 이웃 신청 수락/거절 요청 DTO */
@Getter
@NoArgsConstructor
public class NeighborUpdateRequest {
    private NeighborStatus status;
}