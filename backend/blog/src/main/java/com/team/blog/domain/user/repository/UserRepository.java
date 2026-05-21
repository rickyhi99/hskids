package com.team.blog.domain.user.repository;

import com.team.blog.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// User repo
// 로그인 아이디 기능
public interface UserRepository extends JpaRepository<User, Long> {
    // 로그인 아이디 기능
    Optional<com.team.blog.user.User> findByLoginId(String loginId);
}