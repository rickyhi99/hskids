package com.team.blog.domain.board.controller;

import com.team.blog.domain.board.dto.request.CommentCreateRequest;
import com.team.blog.domain.board.dto.request.CommentUpdateRequest;
import com.team.blog.domain.board.dto.response.CommentResponse;
import com.team.blog.domain.board.service.CommentService;
import com.team.blog.global.api.ApiResponse;
import com.team.blog.global.api.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/api/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> create(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId,
            @RequestBody CommentCreateRequest request) {
        CommentResponse response = commentService.create(userId, postId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(SuccessCode.SUCCESS_CREATED, response));
    }

    @GetMapping("/api/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getComments(postId)));
    }

    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> update(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long commentId,
            @RequestBody CommentUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(commentService.update(userId, commentId, request)));
    }

    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long commentId) {
        commentService.delete(userId, commentId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
