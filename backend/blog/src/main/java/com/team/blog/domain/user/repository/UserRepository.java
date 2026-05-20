package com.team.blog.domain.user.repository;

import com.team.blog.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

/** 유저 레포지토리 */
public interface UserRepository extends JpaRepository<User, Long> {
}