package com.team.blog.domain.board.service;

import com.team.blog.domain.board.dto.request.CommentCreateRequest;
import com.team.blog.domain.board.dto.request.CommentUpdateRequest;
import com.team.blog.domain.board.dto.response.CommentResponse;
import com.team.blog.domain.board.entity.Comment;
import com.team.blog.domain.board.repository.CommentRepository;
import com.team.blog.domain.board.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Transactional
    public CommentResponse create(Long userId, Long postId, CommentCreateRequest request) {
        validatePostExists(postId);
        Comment comment = new Comment(userId, postId, request);
        commentRepository.save(comment);
        return new CommentResponse(comment);
    }

    public List<CommentResponse> getComments(Long postId) {
        validatePostExists(postId);
        return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(CommentResponse::new)
                .toList();
    }

    @Transactional
    public CommentResponse update(Long userId, Long commentId, CommentUpdateRequest request) {
        Comment comment = getCommentOrThrow(commentId);
        validateOwner(comment, userId);
        comment.update(request);
        return new CommentResponse(comment);
    }

    @Transactional
    public void delete(Long userId, Long commentId) {
        Comment comment = getCommentOrThrow(commentId);
        validateOwner(comment, userId);
        commentRepository.delete(comment);
    }

    private void validatePostExists(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new IllegalArgumentException("존재하지 않는 게시글입니다. id=" + postId);
        }
    }

    private Comment getCommentOrThrow(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다. id=" + commentId));
    }

    private void validateOwner(Comment comment, Long userId) {
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 댓글만 수정/삭제할 수 있습니다.");
        }
    }
}