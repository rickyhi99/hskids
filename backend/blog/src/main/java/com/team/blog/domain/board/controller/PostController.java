package com.team.blog.domain.board.controller;

import com.team.blog.domain.board.dto.request.PostCreateRequest;
import com.team.blog.domain.board.dto.request.PostUpdateRequest;
import com.team.blog.domain.board.dto.response.PageResponse;
import com.team.blog.domain.board.dto.response.PostResponse;
import com.team.blog.domain.board.service.PostService;
import com.team.blog.global.api.ApiResponse;
import com.team.blog.global.api.SuccessCode;
import lombok.RequiredArgsConstructor;
<<<<<<< HEAD
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
=======
import org.springframework.http.HttpStatus;
>>>>>>> develop
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

<<<<<<< HEAD
    // TODO: 인증 구현 시 실제 로그인 유저 ID로 교체
    private static final Long TEMP_USER_ID = 1L;

    @PostMapping("/posts")
    public ResponseEntity<PostResponse> create(@RequestBody PostCreateRequest request) {
        PostResponse response = postService.create(TEMP_USER_ID, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> update(
=======
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
>>>>>>> develop
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(postService.update(userId, postId, request)));
    }

<<<<<<< HEAD
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> delete(@PathVariable Long postId) {
        postService.delete(TEMP_USER_ID, postId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/posts")
    public ResponseEntity<PageResponse<PostResponse>> getPosts(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(postService.getPosts(search, pageable));
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

    @GetMapping("/posts/popular")
    public ResponseEntity<List<PostResponse>> getPopular() {
        return ResponseEntity.ok(postService.getPopular());
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> getOne(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getOne(postId));
    }

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<Void> like(@PathVariable Long postId) {
        postService.like(TEMP_USER_ID, postId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts/{postId}/like")
    public ResponseEntity<Void> unlike(@PathVariable Long postId) {
        postService.unlike(TEMP_USER_ID, postId);
        return ResponseEntity.ok().build();
=======
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

    @GetMapping("/liked")
    public ResponseEntity<ApiResponse<Set<Long>>> getLikedPostIds(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(postService.getLikedPostIds(userId)));
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
>>>>>>> develop
    }
}
