package com.team.blog.domain.board.controller;

import com.team.blog.domain.board.dto.request.PostCreateRequest;
import com.team.blog.domain.board.dto.request.PostUpdateRequest;
import com.team.blog.domain.board.dto.response.PageResponse;
import com.team.blog.domain.board.dto.response.PostResponse;
import com.team.blog.domain.board.service.PostService;
import com.team.blog.global.api.ApiResponse;
import com.team.blog.global.api.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping("/posts")
    public ResponseEntity<ApiResponse<PostResponse>> create(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PostCreateRequest request) {
        PostResponse response = postService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(SuccessCode.SUCCESS_CREATED, response));
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> update(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(postService.update(userId, postId, request)));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId) {
        postService.delete(userId, postId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @GetMapping("/posts")
    public ResponseEntity<PageResponse<PostResponse>> getPosts(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(postService.getPosts(search, pageable));
    }

    @GetMapping("/posts/popular")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPopular() {
        return ResponseEntity.ok(ApiResponse.success(postService.getPopular()));
    }

    @GetMapping("/posts/me")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getMyPosts(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(postService.getMyPosts(userId)));
    }

    @GetMapping("/posts/liked")
    public ResponseEntity<ApiResponse<Set<Long>>> getLikedPostIds(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(postService.getLikedPostIds(userId)));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> getOne(@PathVariable Long postId) {
        return ResponseEntity.ok(ApiResponse.success(postService.getOne(postId)));
    }

    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<PageResponse<PostResponse>> getUserPosts(
            @PathVariable Long userId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(postService.getUserPosts(userId, search, category, pageable));
    }

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<ApiResponse<Void>> like(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId) {
        postService.like(userId, postId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @DeleteMapping("/posts/{postId}/like")
    public ResponseEntity<ApiResponse<Void>> unlike(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId) {
        postService.unlike(userId, postId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
