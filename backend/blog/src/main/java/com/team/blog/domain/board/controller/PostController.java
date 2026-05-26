package com.team.blog.domain.board.controller;

import com.team.blog.domain.board.dto.request.PostCreateRequest;
import com.team.blog.domain.board.dto.request.PostUpdateRequest;
import com.team.blog.domain.board.dto.response.PageResponse;
import com.team.blog.domain.board.dto.response.PostResponse;
import com.team.blog.domain.board.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // TODO: 인증 구현 시 실제 로그인 유저 ID로 교체
    private static final Long TEMP_USER_ID = 1L;

    @PostMapping("/posts")
    public ResponseEntity<PostResponse> create(@RequestBody PostCreateRequest request) {
        PostResponse response = postService.create(TEMP_USER_ID, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> update(
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest request) {
        PostResponse response = postService.update(TEMP_USER_ID, postId, request);
        return ResponseEntity.ok(response);
    }

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
    }
}