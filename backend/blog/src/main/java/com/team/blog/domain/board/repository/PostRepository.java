package com.team.blog.domain.board.repository;

import com.team.blog.domain.board.entity.Post;
import com.team.blog.domain.board.entity.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByVisibilityOrderByLikeCountDesc(Visibility visibility);
    List<Post> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    List<Post> findAllByUserIdAndVisibilityOrderByCreatedAtDesc(Long userId, Visibility visibility);

    @Modifying
    @Query("UPDATE Post p SET p.categoryId = null WHERE p.categoryId = :categoryId")
    void clearCategoryId(@Param("categoryId") Long categoryId);
}