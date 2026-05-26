package com.team.blog.domain.category.dto.response;

import com.team.blog.domain.category.entity.Category;

import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        Long userId,
        Long parentId,
        String name,
        int orderNum,
        LocalDateTime createdAt
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getUserId(),
                category.getParentId(),
                category.getName(),
                category.getOrderNum(),
                category.getCreatedAt()
        );
    }
}