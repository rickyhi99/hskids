package com.team.blog.domain.board.repository;

import com.team.blog.domain.board.entity.Post;
import com.team.blog.domain.board.entity.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
=======
import org.springframework.data.jpa.repository.Modifying;
>>>>>>> develop
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByVisibilityOrderByLikeCountDesc(Visibility visibility);
<<<<<<< HEAD

    // 검색어가 있을 때: 제목/내용 LIKE + 닉네임은 서브쿼리로 처리 (Hibernate 7 비연관 엔티티 직접 조인 불가)
    @Query(value = "SELECT p FROM Post p WHERE " +
                   "(LOWER(p.title) LIKE :s1 OR LOWER(p.content) LIKE :s2 " +
                   "OR p.userId IN (SELECT u.id FROM User u WHERE LOWER(u.nickname) LIKE :s3)) " +
                   "AND (:userId IS NULL OR p.userId = :userId) " +
                   "AND (:categoryId IS NULL OR p.categoryId = :categoryId)",
           countQuery = "SELECT COUNT(p) FROM Post p WHERE " +
                        "(LOWER(p.title) LIKE :s1 OR LOWER(p.content) LIKE :s2 " +
                        "OR p.userId IN (SELECT u.id FROM User u WHERE LOWER(u.nickname) LIKE :s3)) " +
                        "AND (:userId IS NULL OR p.userId = :userId) " +
                        "AND (:categoryId IS NULL OR p.categoryId = :categoryId)")
    Page<Post> searchPosts(
            @Param("s1") String s1,
            @Param("s2") String s2,
            @Param("s3") String s3,
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );

    // 검색어가 없을 때: 페이지네이션 + 선택적 userId/categoryId 필터
    @Query(value = "SELECT p FROM Post p " +
                   "WHERE (:userId IS NULL OR p.userId = :userId) " +
                   "AND (:categoryId IS NULL OR p.categoryId = :categoryId)",
           countQuery = "SELECT COUNT(p) FROM Post p " +
                        "WHERE (:userId IS NULL OR p.userId = :userId) " +
                        "AND (:categoryId IS NULL OR p.categoryId = :categoryId)")
    Page<Post> findPostsPage(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );
=======
    List<Post> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    List<Post> findAllByUserIdAndVisibilityOrderByCreatedAtDesc(Long userId, Visibility visibility);

    @Modifying
    @Query("UPDATE Post p SET p.categoryId = null WHERE p.categoryId = :categoryId")
    void clearCategoryId(@Param("categoryId") Long categoryId);
>>>>>>> develop
}