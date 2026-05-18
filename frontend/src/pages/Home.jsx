import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const MOCK_POSTS = [
  {
    id: 1,
    title: '리액트로 블로그 만들기 - 처음부터 끝까지',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    author: '홍길동',
    date: '2026-05-15',
    likes: 142,
    comments: 38,
  },
  {
    id: 2,
    title: '좋은 코드란 무엇인가? 클린코드 원칙 정리',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
    author: '관리자',
    date: '2026-05-14',
    likes: 97,
    comments: 21,
  },
  {
    id: 3,
    title: 'CSS Grid vs Flexbox 언제 무엇을 써야 할까',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    author: '테스터',
    date: '2026-05-13',
    likes: 203,
    comments: 55,
  },
  {
    id: 4,
    title: 'TypeScript를 써야 하는 이유 5가지',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=80',
    author: '홍길동',
    date: '2026-05-12',
    likes: 88,
    comments: 14,
  },
  {
    id: 5,
    title: 'Git 브랜치 전략 - GitFlow부터 Trunk-Based까지',
    thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&q=80',
    author: '관리자',
    date: '2026-05-11',
    likes: 176,
    comments: 43,
  },
  {
    id: 6,
    title: '웹 성능 최적화: Lighthouse 100점 도전기',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
    author: '테스터',
    date: '2026-05-10',
    likes: 61,
    comments: 9,
  },
];

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
        <div className="post-grid">
          {MOCK_POSTS.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-thumbnail-wrap">
                <img src={post.thumbnail} alt={post.title} className="post-thumbnail" />
              </div>
              <div className="post-info">
                <h2 className="post-title">{post.title}</h2>
                <div className="post-meta">
                  <span className="post-author">{post.author}</span>
                  <span className="post-date">{post.date}</span>
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
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
