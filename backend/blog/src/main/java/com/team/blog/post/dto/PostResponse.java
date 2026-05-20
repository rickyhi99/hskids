package com.team.blog.post.dto;

import com.team.blog.common.Visibility;
import com.team.blog.post.Post;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class PostResponse {
    private final Long id;
    private final Long userId;
    private final Long categoryId;
    private final String title;
    private final String content;
    private final String imagePath;
    private final Visibility visibility;
    private final int likeCount;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public PostResponse(Post post) {
        this.id = post.getId();
        this.userId = post.getUserId();
        this.categoryId = post.getCategoryId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.imagePath = post.getImagePath();
        this.visibility = post.getVisibility();
        this.likeCount = post.getLikeCount();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }
}
