package com.team.blog.global.api;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/** 성공 응답 코드 */
@Getter
@RequiredArgsConstructor
public enum SuccessCode {
    SUCCESS_OK(HttpStatus.OK, "요청이 성공적으로 처리되었습니다."),
    SUCCESS_CREATED(HttpStatus.CREATED, "성공적으로 생성되었습니다.");

    private final HttpStatus status;
    private final String message;
}