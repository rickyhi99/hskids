package com.team.blog.global.api;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/** 에러 응답 코드 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다"),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다"),

    // Neighbor
    NEIGHBOR_NOT_FOUND(HttpStatus.NOT_FOUND, "이웃 관계를 찾을 수 없습니다"),
    SELF_NEIGHBOR_REQUEST(HttpStatus.BAD_REQUEST, "자기 자신에게 이웃 신청을 할 수 없습니다"),
    NEIGHBOR_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 이웃 신청했거나 이미 이웃 관계입니다");

    private final HttpStatus status;
    private final String message;
}