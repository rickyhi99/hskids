package com.team.blog.domain.category.repository;

import com.team.blog.domain.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserIdOrderByOrderNumAsc(Long userId);

    List<Category> findByParentId(Long parentId);
}