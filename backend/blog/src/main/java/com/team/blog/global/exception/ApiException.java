package com.team.blog.global.exception;

import com.team.blog.global.api.ErrorCode;
import lombok.Getter;

/** 커스텀 API 예외 */
@Getter
public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;

    public ApiException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}