package com.team.blog.global.api;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/** 에러 응답 코드 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Global
    GLOBAL_INVALID_INPUT(HttpStatus.BAD_REQUEST, "필수 입력값이 누락되었거나 형식이 올바르지 않습니다."),

    // Auth
    AUTH_MISMATCH(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 일치하지 않습니다."),
    AUTH_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "인증 토큰이 만료되었습니다. 다시 로그인 해 주세요."),
    AUTH_INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않거나 변조된 토큰입니다."),

    // User
    USER_DUPLICATED_ID(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다."),
    USER_DUPLICATED_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    USER_DUPLICATED_NICKNAME(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다."),
    USER_WITHDRAWN(HttpStatus.FORBIDDEN, "이미 탈퇴 처리된 계정입니다."),
    USER_PASSWORD_SAME(HttpStatus.BAD_REQUEST, "기존과 동일한 비밀번호로 변경할 수 없습니다."),

    // Category
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 카테고리를 찾을 수 없습니다."),
    CATEGORY_FORBIDDEN(HttpStatus.FORBIDDEN, "본인의 카테고리만 수정/삭제할 수 있습니다."),

    // Neighbor
    NEIGHBOR_WITHDRAWN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
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