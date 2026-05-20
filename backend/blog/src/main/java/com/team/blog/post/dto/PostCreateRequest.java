package com.team.blog.post.dto;

import com.team.blog.common.Visibility;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PostCreateRequest {
    private String title;
    private String content;
    private Long categoryId;
    private Visibility visibility;
    private String imagePath;
}
