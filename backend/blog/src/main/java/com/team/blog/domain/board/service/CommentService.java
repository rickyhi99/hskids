package com.team.blog.domain.board.service;

import com.team.blog.domain.board.dto.request.CommentCreateRequest;
import com.team.blog.domain.board.dto.request.CommentUpdateRequest;
import com.team.blog.domain.board.dto.response.CommentResponse;
import com.team.blog.domain.board.entity.Comment;
import com.team.blog.domain.board.repository.CommentRepository;
import com.team.blog.domain.board.repository.PostRepository;
import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import com.team.blog.global.api.ErrorCode;
import com.team.blog.global.exception.ApiException;
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
    private final UserRepository userRepository;

    @Transactional
    public CommentResponse create(Long userId, Long postId, CommentCreateRequest request) {
        validatePostExists(postId);
        Comment comment = new Comment(userId, postId, request);
        commentRepository.save(comment);
        return toResponse(comment);
    }

    public List<CommentResponse> getComments(Long postId) {
        validatePostExists(postId);
        return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommentResponse update(Long userId, Long commentId, CommentUpdateRequest request) {
        Comment comment = getCommentOrThrow(commentId);
        validateOwner(comment, userId);
        comment.update(request);
        return toResponse(comment);
    }

    @Transactional
    public void delete(Long userId, Long commentId) {
        Comment comment = getCommentOrThrow(commentId);
        validateOwner(comment, userId);
        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment) {
        UserEntity user = userRepository.findById(comment.getUserId()).orElse(null);
        String nickname = user != null ? user.getNickname() : "알 수 없음";
        String profileImg = user != null ? user.getProfileImg() : null;
        return new CommentResponse(comment, nickname, profileImg);
    }

    private void validatePostExists(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ApiException(ErrorCode.POST_NOT_FOUND);
        }
    }

    private Comment getCommentOrThrow(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ApiException(ErrorCode.COMMENT_NOT_FOUND));
    }

    private void validateOwner(Comment comment, Long userId) {
        if (!comment.getUserId().equals(userId)) {
            throw new ApiException(ErrorCode.COMMENT_FORBIDDEN);
        }
    }
}
