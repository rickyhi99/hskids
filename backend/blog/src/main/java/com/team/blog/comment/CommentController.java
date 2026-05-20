package com.team.blog.comment;

import com.team.blog.comment.dto.CommentCreateRequest;
import com.team.blog.comment.dto.CommentResponse;
import com.team.blog.comment.dto.CommentUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // TODO: 인증 구현 시 실제 로그인 유저 ID로 교체
    private static final Long TEMP_USER_ID = 1L;

    @PostMapping("/api/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> create(
            @PathVariable Long postId,
            @RequestBody CommentCreateRequest request) {
        return ResponseEntity.ok(commentService.create(TEMP_USER_ID, postId, request));
    }

    @GetMapping("/api/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getComments(postId));
    }

    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<CommentResponse> update(
            @PathVariable Long commentId,
            @RequestBody CommentUpdateRequest request) {
        return ResponseEntity.ok(commentService.update(TEMP_USER_ID, commentId, request));
    }

    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<Void> delete(@PathVariable Long commentId) {
        commentService.delete(TEMP_USER_ID, commentId);
        return ResponseEntity.noContent().build();
    }
}