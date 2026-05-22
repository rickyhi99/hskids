package com.team.blog.domain.board.controller;

import com.team.blog.domain.board.dto.request.PostCreateRequest;
import com.team.blog.domain.board.dto.request.PostUpdateRequest;
import com.team.blog.domain.board.dto.response.PostResponse;
import com.team.blog.domain.board.service.PostService;
import com.team.blog.global.api.ApiResponse;
import com.team.blog.global.api.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> create(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PostCreateRequest request) {
        PostResponse response = postService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(SuccessCode.SUCCESS_CREATED, response));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> update(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(postService.update(userId, postId, request)));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId) {
        postService.delete(userId, postId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(postService.getAll()));
    }

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPopular() {
        return ResponseEntity.ok(ApiResponse.success(postService.getPopular()));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> getOne(@PathVariable Long postId) {
        return ResponseEntity.ok(ApiResponse.success(postService.getOne(postId)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getMyPosts(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(postService.getMyPosts(userId)));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getUserPosts(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(postService.getUserPosts(userId)));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<ApiResponse<Void>> like(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId) {
        postService.like(userId, postId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<ApiResponse<Void>> unlike(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId) {
        postService.unlike(userId, postId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
