package com.team.blog.domain.board.dto.request;

import com.team.blog.domain.board.entity.Visibility;
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