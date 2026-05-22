import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import RabbitChatbot from '../components/RabbitChatbot';
import * as postApi from '../api/postApi';
import * as neighborApi from '../api/neighborApi';
import './Home.css';

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const stripHtml = (str) => str?.replace(/<[^>]*>/g, '') ?? '';

function PostCard({ post, showVisibility, liked, onLike, onUnlike, isOwner, onEdit, onDelete, onCardClick, onAuthorClick }) {
  const wrapperRef = useRef(null);

  const excerpt = (() => {
    const plain = stripHtml(post.content);
    return plain.length > 120 ? plain.slice(0, 120) + '…' : plain;
  })();

  const handleMouseEnter = () => {
    const el = wrapperRef.current;
    if (el) el.style.transition = 'transform 0.1s linear';
  };

  const handleMouseMove = (e) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale3d(1.03,1.03,1.03)`;
  };

  const handleMouseLeave = () => {
    const el = wrapperRef.current;
    if (el) {
      el.style.transition = 'transform 0.7s cubic-bezier(0.23,1,0.32,1)';
      el.style.transform = '';
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="post-card-tilt animate-on-scroll"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onCardClick}
      style={{ cursor: 'pointer' }}
    >
      <article className="post-card">
        <div className="post-thumbnail-wrap">
          {post.imagePath ? (
            <img
              src={post.imagePath.startsWith('http') ? post.imagePath : `http://localhost:8081${post.imagePath}`}
              alt={post.title}
              className="post-thumbnail"
            />
          ) : (
            <div className="post-thumbnail-placeholder" />
          )}
          {showVisibility && (
            <span className={`post-visibility-badge ${post.visibility === 'PUBLIC' ? 'public' : post.visibility === 'NEIGHBOR' ? 'neighbor' : 'private'}`}>
              {post.visibility === 'PUBLIC' ? '공개' : post.visibility === 'NEIGHBOR' ? '이웃' : '비공개'}
            </span>
          )}
        </div>

        <div className="post-info">
          <h2 className="post-title">{post.title}</h2>
          <p className="post-excerpt">{excerpt || '내용 없음'}</p>

          <div className="post-footer">
            <div className="post-author-row">
              <div
                className="post-author-avatar"
                onClick={(e) => { e.stopPropagation(); onAuthorClick?.(); }}
                style={onAuthorClick ? { cursor: 'pointer' } : {}}
              >
                {post.nickname?.[0] ?? '?'}
              </div>
              <div className="post-author-detail">
                <span
                  className="post-author"
                  onClick={(e) => { e.stopPropagation(); onAuthorClick?.(); }}
                  style={onAuthorClick ? { cursor: 'pointer' } : {}}
                >
                  {post.nickname ?? '알 수 없음'}
                </span>
                <span className="post-date">{formatDate(post.createdAt)}</span>
              </div>
            </div>

            <div className="post-actions">
              <button
                className={`btn-like${liked ? ' liked' : ''}`}
                onClick={(e) => { e.stopPropagation(); liked ? onUnlike(post.id) : onLike(post.id); }}
                title={liked ? '좋아요 취소' : '좋아요'}
              >
                <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {post.likeCount}
              </button>

              {isOwner && (
                <>
                  <button
                    className="btn-card-edit"
                    onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                    title="수정"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="btn-card-delete"
                    onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                    title="삭제"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function PostGrid({ posts, loading, emptyText, showVisibility, likedPosts, onLike, onUnlike, currentUserId, onEdit, onDelete, onCardClick, onAuthorClick }) {
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.1 }
    );
    gridRef.current.querySelectorAll('.post-card-tilt').forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [posts]);

  if (loading) {
    return (
      <div className="feed-status">
        <div className="loading-spinner" />
        <span>불러오는 중...</span>
      </div>
    );
  }

  if (!posts.length) {
    return <div className="feed-status">{emptyText}</div>;
  }

  return (
    <div className="post-grid" ref={gridRef}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          showVisibility={showVisibility}
          liked={likedPosts.has(post.id)}
          onLike={onLike}
          onUnlike={onUnlike}
          isOwner={post.userId === currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          onCardClick={() => onCardClick?.(post.id)}
          onAuthorClick={post.userId !== currentUserId ? () => onAuthorClick?.(post.userId) : null}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, toggleTheme] = useTheme();

  const [activeTab, setActiveTab] = useState('feed');
  const [feedSubTab, setFeedSubTab] = useState('all');

  const [allPosts, setAllPosts] = useState([]);
  const [neighborPosts, setNeighborPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());

  const [loading, setLoading] = useState({ all: false, neighbor: false, my: false });

  const fetched = useRef({ all: false, neighbor: false, my: false });

  // ── 이웃 관리 ──────────────────────────────────────────────────
  const [neighbors, setNeighbors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [neighborMgmtLoading, setNeighborMgmtLoading] = useState(false);
  const neighborFetched = useRef(false);

  useEffect(() => {
    postApi.getLikedPostIds(currentUser.id)
      .then((res) => setLikedPosts(new Set(res.data ?? [])))
      .catch(() => {});
  }, [currentUser.id]);

  // ── 데이터 패치 ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (fetched.current.all) return;
    fetched.current.all = true;
    setLoading((l) => ({ ...l, all: true }));
    try {
      const res = await postApi.getAllPosts();
      setAllPosts(res.data ?? []);
    } catch {
      fetched.current.all = false;
    } finally {
      setLoading((l) => ({ ...l, all: false }));
    }
  }, []);

  const fetchNeighbor = useCallback(async () => {
    if (fetched.current.neighbor) return;
    fetched.current.neighbor = true;
    setLoading((l) => ({ ...l, neighbor: true }));
    try {
      const neighborsRes = await neighborApi.getNeighbors(currentUser.id);
      const neighbors = neighborsRes.data ?? [];
      const postArrays = await Promise.all(
        neighbors.map((n) =>
          postApi.getUserPosts(n.userId).then((r) => r.data ?? []).catch(() => [])
        )
      );
      const merged = postArrays
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNeighborPosts(merged);
    } catch {
      fetched.current.neighbor = false;
    } finally {
      setLoading((l) => ({ ...l, neighbor: false }));
    }
  }, [currentUser]);

  const fetchMy = useCallback(async () => {
    if (fetched.current.my) return;
    fetched.current.my = true;
    setLoading((l) => ({ ...l, my: true }));
    try {
      const res = await postApi.getMyPosts(currentUser.id);
      setMyPosts(res.data ?? []);
    } catch {
      fetched.current.my = false;
    } finally {
      setLoading((l) => ({ ...l, my: false }));
    }
  }, [currentUser]);

  const fetchNeighborMgmt = useCallback(async () => {
    if (neighborFetched.current) return;
    neighborFetched.current = true;
    setNeighborMgmtLoading(true);
    try {
      const [neighborsRes, requestsRes] = await Promise.all([
        neighborApi.getNeighbors(currentUser.id),
        neighborApi.getReceivedRequests(currentUser.id),
      ]);
      setNeighbors(neighborsRes.data ?? []);
      setPendingRequests(requestsRes.data ?? []);
    } catch {
      neighborFetched.current = false;
    } finally {
      setNeighborMgmtLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'feed') {
      if (feedSubTab === 'all') fetchAll();
      else fetchNeighbor();
    } else if (activeTab === 'myblog') {
      fetchMy();
    } else if (activeTab === 'neighbor-mgmt') {
      fetchNeighborMgmt();
    }
  }, [activeTab, feedSubTab, fetchAll, fetchNeighbor, fetchMy, fetchNeighborMgmt]);

  const handleAcceptRequest = useCallback(async (neighborId, fromUserId) => {
    try {
      await neighborApi.updateStatus(currentUser.id, neighborId, 'ACCEPTED');
      setPendingRequests((prev) => prev.filter((r) => r.id !== neighborId));
      neighborFetched.current = false;
      await fetchNeighborMgmt();
    } catch (e) { alert(e.message || '오류가 발생했습니다.'); }
  }, [currentUser, fetchNeighborMgmt]);

  const handleRejectRequest = useCallback(async (neighborId) => {
    try {
      await neighborApi.updateStatus(currentUser.id, neighborId, 'REJECTED');
      setPendingRequests((prev) => prev.filter((r) => r.id !== neighborId));
    } catch (e) { alert(e.message || '오류가 발생했습니다.'); }
  }, [currentUser]);

  const handleDeleteNeighbor = useCallback(async (neighborId) => {
    if (!window.confirm('이웃을 끊으시겠습니까?')) return;
    try {
      await neighborApi.deleteNeighbor(currentUser.id, neighborId);
      setNeighbors((prev) => prev.filter((n) => n.id !== neighborId));
    } catch (e) { alert(e.message || '오류가 발생했습니다.'); }
  }, [currentUser]);

  // ── 좋아요 ────────────────────────────────────────────────────
  const updateCount = (postId, delta) => {
    const upd = (arr) => arr.map((p) => p.id === postId ? { ...p, likeCount: Math.max(0, p.likeCount + delta) } : p);
    setAllPosts(upd);
    setNeighborPosts(upd);
    setMyPosts(upd);
  };

  const handleLike = useCallback(async (postId) => {
    if (likedPosts.has(postId)) return;
    updateCount(postId, 1);
    setLikedPosts((prev) => new Set([...prev, postId]));
    try {
      await postApi.likePost(currentUser.id, postId);
    } catch {
      updateCount(postId, -1);
      setLikedPosts((prev) => { const s = new Set(prev); s.delete(postId); return s; });
    }
  }, [currentUser, likedPosts]);

  const handleUnlike = useCallback(async (postId) => {
    if (!likedPosts.has(postId)) return;
    updateCount(postId, -1);
    setLikedPosts((prev) => { const s = new Set(prev); s.delete(postId); return s; });
    try {
      await postApi.unlikePost(currentUser.id, postId);
    } catch {
      updateCount(postId, 1);
      setLikedPosts((prev) => new Set([...prev, postId]));
    }
  }, [currentUser, likedPosts]);

  const handleCardClick = useCallback((postId) => {
    navigate(`/post/${postId}`);
  }, [navigate]);

  const handleAuthorClick = useCallback((userId) => {
    navigate(`/blog/${userId}`);
  }, [navigate]);

  // ── 수정 ─────────────────────────────────────────────────────
  const handleEdit = useCallback((post) => {
    navigate('/write', { state: { post } });
  }, [navigate]);

  // ── 삭제 ─────────────────────────────────────────────────────
  const handleDelete = useCallback(async (postId) => {
    if (!window.confirm('이 글을 삭제하시겠습니까?')) return;
    try {
      await postApi.deletePost(currentUser.id, postId);
      const filter = (arr) => arr.filter((p) => p.id !== postId);
      setAllPosts(filter);
      setNeighborPosts(filter);
      setMyPosts(filter);
    } catch (e) {
      alert(e.message || '삭제 중 오류가 발생했습니다.');
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const gridProps = {
    likedPosts,
    onLike: handleLike,
    onUnlike: handleUnlike,
    currentUserId: currentUser?.id,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onCardClick: handleCardClick,
    onAuthorClick: handleAuthorClick,
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-logo">BLOG</h1>
        <div className="home-header-right">
          <span className="home-welcome">{currentUser?.nickname}님 환영합니다</span>
          <button className="btn-theme" onClick={toggleTheme} title={dark ? '라이트 모드' : '다크 모드'}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button className="btn-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      <main className="home-main">
        {/* 메인 탭 */}
        <div className="main-tabs">
          <button
            className={`main-tab${activeTab === 'feed' ? ' active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            피드
          </button>
          <button
            className={`main-tab${activeTab === 'myblog' ? ' active' : ''}`}
            onClick={() => setActiveTab('myblog')}
          >
            내 블로그
          </button>
          <button
            className={`main-tab${activeTab === 'neighbor-mgmt' ? ' active' : ''}`}
            onClick={() => setActiveTab('neighbor-mgmt')}
          >
            이웃 관리
            {pendingRequests.length > 0 && (
              <span className="tab-badge">{pendingRequests.length}</span>
            )}
          </button>
        </div>

        {/* 피드 서브탭 */}
        {activeTab === 'feed' && (
          <div className="feed-subtabs">
            <button
              className={`feed-subtab${feedSubTab === 'all' ? ' active' : ''}`}
              onClick={() => setFeedSubTab('all')}
            >
              전체
            </button>
            <button
              className={`feed-subtab${feedSubTab === 'neighbor' ? ' active' : ''}`}
              onClick={() => setFeedSubTab('neighbor')}
            >
              이웃
            </button>
          </div>
        )}

        {/* 콘텐츠 */}
        {activeTab === 'feed' && feedSubTab === 'all' && (
          <PostGrid posts={allPosts} loading={loading.all} emptyText="아직 게시글이 없습니다." {...gridProps} />
        )}
        {activeTab === 'feed' && feedSubTab === 'neighbor' && (
          <PostGrid posts={neighborPosts} loading={loading.neighbor} emptyText="이웃이 없거나 이웃의 게시글이 없습니다." {...gridProps} />
        )}
        {activeTab === 'myblog' && (
          <PostGrid posts={myPosts} loading={loading.my} emptyText="아직 작성한 글이 없습니다." showVisibility {...gridProps} />
        )}

        {activeTab === 'neighbor-mgmt' && (
          <div className="neighbor-mgmt">
            {neighborMgmtLoading ? (
              <div className="feed-status"><div className="loading-spinner" /><span>불러오는 중...</span></div>
            ) : (
              <>
                {/* 받은 이웃 신청 */}
                <section className="neighbor-section">
                  <h2 className="neighbor-section-title">
                    받은 이웃 신청
                    {pendingRequests.length > 0 && <span className="tab-badge">{pendingRequests.length}</span>}
                  </h2>
                  {pendingRequests.length === 0 ? (
                    <p className="neighbor-empty">받은 이웃 신청이 없습니다.</p>
                  ) : (
                    <ul className="neighbor-list">
                      {pendingRequests.map((req) => (
                        <li key={req.id} className="neighbor-item">
                          <div className="neighbor-avatar">{req.nickname?.[0] ?? '?'}</div>
                          <span
                            className="neighbor-name clickable"
                            onClick={() => navigate(`/blog/${req.fromUserId}`)}
                          >
                            {req.nickname}
                          </span>
                          <div className="neighbor-item-actions">
                            <button
                              className="btn-accept"
                              onClick={() => handleAcceptRequest(req.id, req.fromUserId)}
                            >
                              수락
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleRejectRequest(req.id)}
                            >
                              거절
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* 이웃 목록 */}
                <section className="neighbor-section">
                  <h2 className="neighbor-section-title">이웃 목록 ({neighbors.length})</h2>
                  {neighbors.length === 0 ? (
                    <p className="neighbor-empty">아직 이웃이 없습니다.</p>
                  ) : (
                    <ul className="neighbor-list">
                      {neighbors.map((n) => (
                        <li key={n.id} className="neighbor-item">
                          <div className="neighbor-avatar">{n.nickname?.[0] ?? '?'}</div>
                          <span
                            className="neighbor-name clickable"
                            onClick={() => navigate(`/blog/${n.userId}`)}
                          >
                            {n.nickname}
                          </span>
                          <button
                            className="btn-delete-neighbor"
                            onClick={() => handleDeleteNeighbor(n.id)}
                          >
                            이웃 끊기
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}
          </div>
        )}
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
