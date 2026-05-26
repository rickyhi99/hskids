package com.team.blog.domain.board.dto.response;

import com.team.blog.domain.board.entity.Comment;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CommentResponse {
    private final Long id;
    private final Long postId;
    private final Long userId;
    private final String nickname;
    private final String profileImg;
    private final String content;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public CommentResponse(Comment comment, String nickname, String profileImg) {
        this.id = comment.getId();
        this.postId = comment.getPostId();
        this.userId = comment.getUserId();
        this.nickname = nickname;
        this.profileImg = profileImg;
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
    }
}
