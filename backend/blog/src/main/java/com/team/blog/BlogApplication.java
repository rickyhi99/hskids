package com.team.blog;

import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// 보안 설정 이슈가 있답니다
// 진짜 원인: Spring Boot가 우리 SecurityConfig 말고도 자기 기본 보안 필터를 하나 더 만들어요.
// 둘이 충돌해서 우리 permitAll() 설정이 무시되는 거예요.
@SpringBootApplication
public class BlogApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlogApplication.class, args);
	}

	// 앱 시작 시 테스트 유저 자동 삽입 (개발용)
	@Bean
	CommandLineRunner initTestUser(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByLoginId("testuser").isEmpty()) {
				userRepository.save(UserEntity.builder()
						.loginId("testuser")
						.password(passwordEncoder.encode("1234"))
						.email("test@test.com")
						.nickname("iamtest")
						.build());
				System.out.println("테스트 유저 생성 완료: testuser / 1234");
			}
		};
	}
}
