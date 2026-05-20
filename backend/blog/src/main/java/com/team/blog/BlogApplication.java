package com.team.blog;

import com.team.blog.repo.UserRepo;
import com.team.blog.user.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class BlogApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlogApplication.class, args);
	}

	// 앱 시작 시 테스트 유저 자동 삽입 (개발용)
	@Bean
	CommandLineRunner initTestUser(UserRepo userRepo, BCryptPasswordEncoder encoder) {
		return args -> {
			if (userRepo.findByLoginId("testuser").isEmpty()) {
				userRepo.save(User.builder()
						.loginId("testuser")
						.pwd(encoder.encode("1234"))
						.email("test@test.com")
						.role("ROLE_USER")
						.build());
				System.out.println("테스트 유저 생성 완료: testuser / 1234");
			}
		};
	}
}
