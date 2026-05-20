package com.team.blog.repo;

import com.team.blog.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByLoginId(String loginId);
}
