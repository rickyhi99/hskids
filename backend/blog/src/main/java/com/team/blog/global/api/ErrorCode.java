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
    NEIGHBOR_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 이웃 신청했거나 이미 이웃 관계입니다"),

    // Board
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다"),
    POST_FORBIDDEN(HttpStatus.FORBIDDEN, "본인의 게시글만 수정/삭제할 수 있습니다"),
    POST_LIKE_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 좋아요를 눌렀습니다"),
    POST_LIKE_NOT_FOUND(HttpStatus.NOT_FOUND, "좋아요를 누르지 않은 게시글입니다"),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다"),
    COMMENT_FORBIDDEN(HttpStatus.FORBIDDEN, "본인의 댓글만 수정/삭제할 수 있습니다");

    private final HttpStatus status;
    private final String message;
}