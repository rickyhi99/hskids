package com.team.blog.domain.board.entity;

import com.team.blog.domain.board.dto.request.PostCreateRequest;
import com.team.blog.domain.board.dto.request.PostUpdateRequest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "category_id")
    private Long categoryId;

    private String title;

    @Lob
    private String content;

    private String imagePath;

    @Enumerated(EnumType.STRING)
    private Visibility visibility;

    private int likeCount = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Post(Long userId, PostCreateRequest request) {
        this.userId = userId;
        this.categoryId = request.getCategoryId();
        this.title = request.getTitle();
        this.content = request.getContent();
        this.imagePath = request.getImagePath();
        this.visibility = request.getVisibility();
    }

    public void update(PostUpdateRequest request) {
        this.categoryId = request.getCategoryId();
        this.title = request.getTitle();
        this.content = request.getContent();
        this.imagePath = request.getImagePath();
        this.visibility = request.getVisibility();
    }

    public void increaseLikeCount() {
        this.likeCount++;
    }

    public void decreaseLikeCount() {
        if (this.likeCount > 0) this.likeCount--;
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