package com.team.blog.domain.category.repository;

import com.team.blog.domain.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserIdOrderByOrderNumAsc(Long userId);

    @Modifying
    @Query("UPDATE Category c SET c.parentId = null WHERE c.parentId = :parentId")
    void clearParentId(@Param("parentId") Long parentId);
}