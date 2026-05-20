package com.team.blog.global.api;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/** 성공 응답 코드 */
@Getter
@RequiredArgsConstructor
public enum SuccessCode {
    SUCCESS_DEFAULT(HttpStatus.OK, "성공"),
    SUCCESS_CREATED(HttpStatus.CREATED, "생성 성공");

    private final HttpStatus status;
    private final String message;
}