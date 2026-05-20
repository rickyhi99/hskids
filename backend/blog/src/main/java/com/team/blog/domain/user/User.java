package com.team.blog.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seq;

    @Column(unique = true, nullable = false)
    private String loginId;  // 로그인 아이디 (JPA 기본키 id와 혼동 방지)

    @Column(nullable = false)
    private String pwd;

    private String email;

    private String role; // "ROLE_USER", "ROLE_ADMIN"
}
