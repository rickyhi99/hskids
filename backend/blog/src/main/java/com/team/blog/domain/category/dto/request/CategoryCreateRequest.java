package com.team.blog.domain.category.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CategoryCreateRequest {
    private String name;
    private Long parentId;
    private int orderNum;
}