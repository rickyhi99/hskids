import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as postApi from '../api/postApi';
import * as neighborApi from '../api/neighborApi';
import * as categoryApi from '../api/categoryApi';
import * as userApi from '../api/userApi';
import Avatar from '../components/Avatar';
import './UserBlog.css';

const BASE_URL = 'http://localhost:8081';

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const stripHtml = (str) => str?.replace(/<[^>]*>/g, '') ?? '';

// status → 버튼 텍스트/색상
const NEIGHBOR_BTN = {
  NONE:             { label: '이웃 신청', className: 'btn-neighbor-request' },
  PENDING_SENT:     { label: '신청 취소', className: 'btn-neighbor-cancel' },
  PENDING_RECEIVED: { label: '수락하기',  className: 'btn-neighbor-accept' },
  ACCEPTED:         { label: '이웃 끊기', className: 'btn-neighbor-delete' },
};

export default function UserBlog() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [profileImg, setProfileImg] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [activeSubCatId, setActiveSubCatId] = useState(null);

  const [neighborStatus, setNeighborStatus] = useState(null);
  const [neighborId, setNeighborId] = useState(null);
  const [neighborLoading, setNeighborLoading] = useState(false);

  const isMyBlog = currentUser?.id === Number(userId);

  useEffect(() => {
    // userId가 바뀌면 이전 사용자 데이터를 즉시 초기화
    setPosts([]);
    setNickname('');
    setProfileImg(null);
    setCategories([]);
    setActiveCatId(null);
    setActiveSubCatId(null);
    setNeighborStatus(null);
    setNeighborId(null);
    setLoading(true);

    const fetchData = async () => {
      try {
        const [postsRes, catsRes, userRes] = await Promise.all([
          postApi.getUserPosts(userId),
          categoryApi.getCategories(userId),
          userApi.getUserInfo(userId),
        ]);
        setPosts(postsRes.data ?? []);
        setCategories(catsRes.data ?? []);
        setNickname(userRes.data?.nickname ?? '');
        setProfileImg(userRes.data?.profileImg ?? null);
      } finally {
        setLoading(false);
      }

      // 이웃 상태는 포스트/카테고리와 별도로 처리 (실패해도 나머지 UI에 영향 없음)
      if (!isMyBlog) {
        try {
          const statusRes = await neighborApi.getStatusWith(currentUser.id, userId);
          setNeighborStatus(statusRes.data.status);
          setNeighborId(statusRes.data.neighborId);
        } catch {
          setNeighborStatus('NONE');
        }
      }
    };

    fetchData();
  }, [userId, currentUser.id, isMyBlog]);

  const handleNeighborBtn = async () => {
    if (neighborLoading) return;
    setNeighborLoading(true);
    try {
      if (neighborStatus === 'NONE') {
        const res = await neighborApi.sendRequest(Number(userId));
        setNeighborStatus('PENDING_SENT');
        setNeighborId(res.data.id);
      } else if (neighborStatus === 'PENDING_SENT') {
        await neighborApi.deleteNeighbor(neighborId);
        setNeighborStatus('NONE');
        setNeighborId(null);
      } else if (neighborStatus === 'PENDING_RECEIVED') {
        await neighborApi.updateStatus(neighborId, 'ACCEPTED');
        setNeighborStatus('ACCEPTED');
      } else if (neighborStatus === 'ACCEPTED') {
        if (!window.confirm('이웃을 끊으시겠습니까?')) return;
        await neighborApi.deleteNeighbor(neighborId);
        setNeighborStatus('NONE');
        setNeighborId(null);
      }
    } catch (err) {
      alert(err.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setNeighborLoading(false);
    }
  };

  const handlePostClick = (postId) => navigate(`/post/${postId}`);

  const btn = neighborStatus ? NEIGHBOR_BTN[neighborStatus] : null;

  const topLevelCats = categories.filter((c) => !c.parentId);
  const activeSubCats = activeCatId
    ? categories.filter((c) => c.parentId === activeCatId)
    : [];

  const catPostCount = (catId) => {
    const childIds = categories.filter((c) => c.parentId === catId).map((c) => c.id);
    return posts.filter((p) => p.categoryId === catId || childIds.includes(p.categoryId)).length;
  };

  const filteredPosts = (() => {
    if (!activeCatId) return posts;
    if (activeSubCatId) return posts.filter((p) => p.categoryId === activeSubCatId);
    const childIds = activeSubCats.map((c) => c.id);
    return posts.filter((p) => p.categoryId === activeCatId || childIds.includes(p.categoryId));
  })();

  return (
    <div className="userblog-page">
      <header className="userblog-header">
        <button className="userblog-back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          뒤로
        </button>
        <div className="userblog-header-spacer" />
        {!isMyBlog && btn && (
          <button
            className={`btn-neighbor ${btn.className}`}
            onClick={handleNeighborBtn}
            disabled={neighborLoading}
          >
            {neighborLoading ? '처리 중...' : btn.label}
          </button>
        )}
      </header>

      <div className="userblog-profile">
        <Avatar
          profileImg={profileImg}
          nickname={nickname}
          className="userblog-profile-avatar"
        />
        <h1 className="userblog-profile-title">
          {nickname ? `${nickname}의 블로그` : '블로그'}
        </h1>
      </div>

      <main className="userblog-main">
        {/* 카테고리 필터 */}
        {!loading && categories.length > 0 && (
          <div className="userblog-cat-section">
            {/* 상위 카테고리 탭 */}
            <div className="userblog-cat-bar">
              <button
                className={`userblog-cat-btn${!activeCatId ? ' active' : ''}`}
                onClick={() => { setActiveCatId(null); setActiveSubCatId(null); }}
              >
                전체 <span className="cat-count">{posts.length}</span>
              </button>
              {topLevelCats.map((cat) => (
                <button
                  key={cat.id}
                  className={`userblog-cat-btn${activeCatId === cat.id ? ' active' : ''}`}
                  onClick={() => { setActiveCatId(cat.id); setActiveSubCatId(null); }}
                >
                  {cat.name} <span className="cat-count">{catPostCount(cat.id)}</span>
                </button>
              ))}
            </div>

            {/* 하위 카테고리 탭 (상위 선택 시 노출) */}
            {activeSubCats.length > 0 && (
              <div className="userblog-subcat-bar">
                <button
                  className={`userblog-subcat-btn${!activeSubCatId ? ' active' : ''}`}
                  onClick={() => setActiveSubCatId(null)}
                >
                  전체
                </button>
                {activeSubCats.map((sub) => (
                  <button
                    key={sub.id}
                    className={`userblog-subcat-btn${activeSubCatId === sub.id ? ' active' : ''}`}
                    onClick={() => setActiveSubCatId(sub.id)}
                  >
                    {sub.name}
                    <span className="cat-count">
                      {posts.filter((p) => p.categoryId === sub.id).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="userblog-status">
            <div className="loading-spinner" />
            <span>불러오는 중...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="userblog-status">
            {activeCatId ? '해당 카테고리의 게시글이 없습니다.' : '게시글이 없습니다.'}
          </div>
        ) : (
          <div className="userblog-grid">
            {filteredPosts.map((post) => {
              const excerpt = (() => {
                const plain = stripHtml(post.content);
                return plain.length > 100 ? plain.slice(0, 100) + '…' : plain;
              })();
              const imageUrl = post.imagePath
                ? (post.imagePath.startsWith('http') ? post.imagePath : `${BASE_URL}${post.imagePath}`)
                : null;

              return (
                <article
                  key={post.id}
                  className="userblog-card"
                  onClick={() => handlePostClick(post.id)}
                >
                  <div className="userblog-thumbnail-wrap">
                    {imageUrl ? (
                      <img src={imageUrl} alt={post.title} className="userblog-thumbnail" />
                    ) : (
                      <div className="userblog-thumbnail-placeholder" />
                    )}
                  </div>
                  <div className="userblog-card-body">
                    <h2 className="userblog-card-title">{post.title}</h2>
                    <p className="userblog-card-excerpt">{excerpt || '내용 없음'}</p>
                    <div className="userblog-card-footer">
                      <span className="userblog-card-date">{formatDate(post.createdAt)}</span>
                      <span className="userblog-card-like">♥ {post.likeCount}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
