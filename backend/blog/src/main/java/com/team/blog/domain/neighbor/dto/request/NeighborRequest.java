package com.team.blog.domain.neighbor.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

/** 이웃 신청 요청 DTO */
@Getter
@NoArgsConstructor
public class NeighborRequest {
    private Long toUserId;
}