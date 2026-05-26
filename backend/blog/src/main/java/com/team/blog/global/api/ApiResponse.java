package com.team.blog.global.api;

/** 공통 API 응답 래퍼 */
public record ApiResponse<T>(
        Status status,
        Enum<?> code,
        String message,
        T data
) {
    public static <T> ApiResponse<T> success(SuccessCode successCode, T data) {
        return new ApiResponse<>(Status.SUCCESS, successCode, null, data);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(Status.SUCCESS, SuccessCode.SUCCESS_OK, null, data);
    }

    public static ApiResponse<Void> success(SuccessCode successCode) {
        return new ApiResponse<>(Status.SUCCESS, successCode, null, null);
    }

    public static ApiResponse<Void> success() {
        return new ApiResponse<>(Status.SUCCESS, SuccessCode.SUCCESS_OK, null, null);
    }

    public static <T> ApiResponse<T> fail(ErrorCode errorCode, T data) {
        return new ApiResponse<>(Status.ERROR, errorCode, errorCode.getMessage(), data);
    }

    public static ApiResponse<Void> fail(ErrorCode errorCode) {
        return new ApiResponse<>(Status.ERROR, errorCode, errorCode.getMessage(), null);
    }
}