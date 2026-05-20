package com.team.blog.domain.board.controller;

import com.team.blog.domain.board.dto.request.PostCreateRequest;
import com.team.blog.domain.board.dto.request.PostUpdateRequest;
import com.team.blog.domain.board.dto.response.PostResponse;
import com.team.blog.domain.board.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // TODO: 인증 구현 시 실제 로그인 유저 ID로 교체
    private static final Long TEMP_USER_ID = 1L;

    @PostMapping
    public ResponseEntity<PostResponse> create(@RequestBody PostCreateRequest request) {
        PostResponse response = postService.create(TEMP_USER_ID, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> update(
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest request) {
        PostResponse response = postService.update(TEMP_USER_ID, postId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(@PathVariable Long postId) {
        postService.delete(TEMP_USER_ID, postId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAll() {
        return ResponseEntity.ok(postService.getAll());
    }

    @GetMapping("/popular")
    public ResponseEntity<List<PostResponse>> getPopular() {
        return ResponseEntity.ok(postService.getPopular());
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getOne(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getOne(postId));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> like(@PathVariable Long postId) {
        postService.like(TEMP_USER_ID, postId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<Void> unlike(@PathVariable Long postId) {
        postService.unlike(TEMP_USER_ID, postId);
        return ResponseEntity.ok().build();
    }
}