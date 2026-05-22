package com.team.blog.domain.category.entity;

import com.team.blog.domain.category.dto.request.CategoryCreateRequest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Getter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(nullable = false)
    private String name;

    @Column(name = "order_num", nullable = false)
    private int orderNum;

    private LocalDateTime createdAt;

    public static Category of(Long userId, CategoryCreateRequest request) {
        Category category = new Category();
        category.userId = userId;
        category.parentId = request.getParentId();
        category.name = request.getName();
        category.orderNum = request.getOrderNum();
        return category;
    }

    public void update(String name, int orderNum) {
        this.name = name;
        this.orderNum = orderNum;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}