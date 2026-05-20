package com.team.blog.comment;

import com.team.blog.comment.dto.CommentCreateRequest;
import com.team.blog.comment.dto.CommentUpdateRequest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@NoArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id")
    private Long postId;

    @Column(name = "user_id")
    private Long userId;

    private String content;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Comment(Long userId, Long postId, CommentCreateRequest request) {
        this.userId = userId;
        this.postId = postId;
        this.content = request.getContent();
    }

    public void update(CommentUpdateRequest request) {
        this.content = request.getContent();
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}