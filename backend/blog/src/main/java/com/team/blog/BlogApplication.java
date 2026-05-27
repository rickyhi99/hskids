package com.team.blog;

import com.team.blog.domain.user.entity.UserEntity;
import com.team.blog.domain.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;

@SpringBootApplication
public class BlogApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlogApplication.class, args);
	}

	@Bean
	CommandLineRunner initTestData(UserRepository userRepository,
								   BCryptPasswordEncoder passwordEncoder,
								   JdbcTemplate jdbc) {
		return args -> {
			// ── testuser 생성 ──────────────────────────────────────
			if (userRepository.findByLoginId("testuser").isEmpty()) {
				userRepository.save(UserEntity.builder()
						.loginId("testuser")
						.password(passwordEncoder.encode("1234"))
						.email("test@test.com")
						.nickname("iamtest")
						.build());
				System.out.println("테스트 유저 생성 완료: testuser / 1234");
			}

			Long userId = userRepository.findByLoginId("testuser").get().getId();

			// ── 포스트 25개 생성 ────────────────────────────────────
			String[][] posts = {
				{"Spring Boot 시작하기", "Spring Boot는 복잡한 XML 설정 없이도 빠르게 애플리케이션을 만들 수 있게 도와주는 프레임워크입니다.", "12"},
				{"JPA와 Hibernate의 차이", "JPA는 명세(인터페이스)이고, Hibernate는 그 구현체입니다. Spring Data JPA는 둘을 더 편리하게 사용할 수 있도록 추상화한 계층입니다.", "8"},
				{"REST API 설계 원칙", "REST API는 자원(Resource), 행위(Verb), 표현(Representation)으로 구성됩니다. URI는 명사로, HTTP 메서드로 행위를 표현하세요.", "21"},
				{"Docker 입문기", "Docker를 처음 접했을 때의 당황스러움이 아직도 생생합니다. 컨테이너 개념부터 차근차근 정리해봤습니다.", "5"},
				{"Git 브랜치 전략 정리", "Git Flow, GitHub Flow, Trunk-based Development 세 가지 전략의 장단점을 비교해봤습니다.", "34"},
				{"React hooks 완전 정복", "useState, useEffect, useCallback, useMemo... 각 hook이 언제 필요한지 실제 예제와 함께 알아봅니다.", "19"},
				{"데이터베이스 인덱스란?", "인덱스는 책의 목차와 같습니다. 조회 성능을 크게 높여주지만 쓰기 성능과 저장 공간을 소모합니다.", "7"},
				{"오늘 배운 것 - JWT", "JWT(JSON Web Token)는 Header, Payload, Signature 세 부분으로 구성됩니다. 서버에 상태를 저장하지 않는 stateless 인증에 적합합니다.", "15"},
				{"알고리즘 스터디 4주차", "이번 주는 그래프 탐색 BFS/DFS를 집중적으로 풀었습니다. 큐와 스택의 차이를 다시 한번 느꼈습니다.", "3"},
				{"코드 리뷰 잘 하는 법", "좋은 코드 리뷰는 코드가 아닌 사람을 존중합니다. 'You should' 대신 'What if we tried...'로 시작해보세요.", "28"},
				{"TypeScript 왜 쓰나요?", "JavaScript에 타입을 추가하면 런타임 에러를 컴파일 시점에 잡을 수 있습니다. 협업 시 특히 빛을 발합니다.", "11"},
				{"첫 사이드 프로젝트 회고", "3개월간 진행한 사이드 프로젝트를 마무리했습니다. 기술보다 소통이 더 중요하다는 걸 깨달았습니다.", "42"},
				{"SQL JOIN 완벽 정리", "INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN의 차이를 다이어그램과 함께 설명합니다.", "16"},
				{"클린 코드 독서 후기", "로버트 마틴의 클린 코드를 읽고 나서 변수 이름 하나도 다시 보게 됐습니다. 강력 추천합니다.", "9"},
				{"Linux 기본 명령어 모음", "ls, cd, grep, awk, sed, ps, kill... 개발자가 알아야 할 리눅스 명령어를 한 곳에 정리했습니다.", "24"},
				{"HTTP vs HTTPS", "HTTPS는 HTTP에 TLS(전송 계층 보안)를 추가한 것입니다. 인증서 발급부터 적용까지 정리해봤습니다.", "6"},
				{"재귀함수 이해하기", "재귀는 함수가 자기 자신을 호출하는 것입니다. 피보나치, 팩토리얼 예제로 기본기를 다져봅시다.", "13"},
				{"CSS Grid vs Flexbox", "언제 Grid를 쓰고 언제 Flexbox를 쓸지 헷갈리시나요? 간단한 기준을 공유합니다.", "18"},
				{"Spring Security 설정하기", "Spring Security는 강력하지만 처음엔 설정이 어렵습니다. JWT 인증 필터를 직접 구현한 과정을 공유합니다.", "31"},
				{"개발자 번아웃 극복기", "열심히 공부하다 갑자기 아무것도 하기 싫어졌습니다. 번아웃을 인식하고 회복한 과정을 솔직하게 씁니다.", "47"},
				{"CI/CD 파이프라인 구축", "GitHub Actions로 테스트 자동화, 빌드, 배포까지 이어지는 파이프라인을 구성하는 방법을 소개합니다.", "22"},
				{"객체지향 5원칙 SOLID", "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. 실제 코드로 살펴봅니다.", "14"},
				{"Redis 캐시 적용기", "자주 조회되는 데이터를 Redis에 캐싱해서 응답 속도를 3배 줄인 경험을 공유합니다.", "37"},
				{"테스트 코드 작성 습관", "테스트 코드는 미래의 나에게 보내는 편지입니다. JUnit5와 Mockito로 의미 있는 테스트를 작성하는 법을 정리합니다.", "20"},
				{"프론트엔드 성능 최적화", "이미지 지연 로딩, 코드 스플리팅, 메모이제이션... 실제 서비스에 적용한 최적화 기법들을 공유합니다.", "29"},
			};

			String sql = "INSERT INTO posts (user_id, title, content, visibility, like_count, created_at, updated_at) VALUES (?, ?, ?, 'PUBLIC', ?, ?, ?)";
			for (int i = 0; i < posts.length; i++) {
				LocalDateTime createdAt = LocalDateTime.now().minusDays(posts.length - i);
				jdbc.update(sql, userId, posts[i][0], posts[i][1], Integer.parseInt(posts[i][2]), createdAt, createdAt);
			}
			System.out.println("테스트 포스트 25개 생성 완료");
		};
	}
}
