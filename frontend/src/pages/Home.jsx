import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RabbitChatbot from '../components/RabbitChatbot';
import './Home.css';

const MOCK_POSTS = [
  {
    id: 1,
    title: '리액트로 블로그 만들기 - 처음부터 끝까지',
    excerpt: 'Create React App부터 배포까지, 실전 블로그 제작 과정을 단계별로 정리했습니다.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    category: 'React',
    author: '홍길동',
    date: '2026-05-15',
    likes: 142,
    comments: 38,
  },
  {
    id: 2,
    title: '좋은 코드란 무엇인가? 클린코드 원칙 정리',
    excerpt: '로버트 마틴의 클린코드를 읽고 실무에서 바로 적용할 수 있는 핵심 원칙들을 요약했습니다.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
    category: '개발 문화',
    author: '관리자',
    date: '2026-05-14',
    likes: 97,
    comments: 21,
  },
  {
    id: 3,
    title: 'CSS Grid vs Flexbox 언제 무엇을 써야 할까',
    excerpt: '두 레이아웃 시스템의 차이점과 각각 적합한 상황을 예제와 함께 비교 분석합니다.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    category: 'CSS',
    author: '테스터',
    date: '2026-05-13',
    likes: 203,
    comments: 55,
  },
  {
    id: 4,
    title: 'TypeScript를 써야 하는 이유 5가지',
    excerpt: '타입 안정성부터 IDE 지원까지, 프로젝트에 TypeScript를 도입해야 하는 이유를 정리했습니다.',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=80',
    category: 'TypeScript',
    author: '홍길동',
    date: '2026-05-12',
    likes: 88,
    comments: 14,
  },
  {
    id: 5,
    title: 'Git 브랜치 전략 - GitFlow부터 Trunk-Based까지',
    excerpt: '팀 규모와 배포 주기에 맞는 브랜치 전략을 선택하는 기준과 실전 사례를 소개합니다.',
    thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&q=80',
    category: 'Git',
    author: '관리자',
    date: '2026-05-11',
    likes: 176,
    comments: 43,
  },
  {
    id: 6,
    title: '웹 성능 최적화: Lighthouse 100점 도전기',
    excerpt: '이미지 최적화, 코드 스플리팅, 캐싱 전략까지 실제 점수를 올린 과정을 공유합니다.',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
    category: '성능',
    author: '테스터',
    date: '2026-05-10',
    likes: 61,
    comments: 9,
  },
];

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = gridRef.current?.querySelectorAll('.post-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-logo">BLOG</h1>
        <div className="home-header-right">
          <span className="home-welcome">{currentUser?.name}님 환영합니다</span>
          <button className="btn-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      <main className="home-main">
        <div className="post-grid" ref={gridRef}>
          {MOCK_POSTS.map((post) => (
            <article key={post.id} className="post-card animate-on-scroll">
              <div className="post-thumbnail-wrap">
                <img src={post.thumbnail} alt={post.title} className="post-thumbnail" />
                <span className="post-category">{post.category}</span>
              </div>
              <div className="post-info">
                <h2 className="post-title">{post.title}</h2>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-footer">
                  <div className="post-author-row">
                    <div className="post-author-avatar">{post.author[0]}</div>
                    <div className="post-author-detail">
                      <span className="post-author">{post.author}</span>
                      <span className="post-date">{post.date}</span>
                    </div>
                  </div>
                  <div className="post-stats">
                    <span className="stat">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {post.likes}
                    </span>
                    <span className="stat">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <RabbitChatbot />

      <button className="btn-write" onClick={() => navigate('/write')} aria-label="글쓰기">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="btn-write-text">글쓰기</span>
      </button>
    </div>
  );
}
