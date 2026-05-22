package com.team.blog.domain.board.repository;

import com.team.blog.domain.board.entity.Post;
import com.team.blog.domain.board.entity.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByVisibilityOrderByLikeCountDesc(Visibility visibility);
    List<Post> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    List<Post> findAllByUserIdAndVisibilityOrderByCreatedAtDesc(Long userId, Visibility visibility);
}