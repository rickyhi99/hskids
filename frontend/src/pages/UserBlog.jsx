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

const NEIGHBOR_BTN = {
  NONE:             { label: '이웃 신청', className: 'btn-neighbor-request' },
  PENDING_SENT:     { label: '신청 취소', className: 'btn-neighbor-cancel' },
  PENDING_RECEIVED: { label: '수락하기',  className: 'btn-neighbor-accept' },
  ACCEPTED:         { label: '이웃 끊기', className: 'btn-neighbor-delete' },
};

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(0, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  if (left > 0) pages.push(0);
  if (left > 1) pages.push('ellipsis-start');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 2) pages.push('ellipsis-end');
  if (right < totalPages - 1) pages.push(totalPages - 1);

  return (
    <div className="userblog-pagination">
      <button
        className="userblog-page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        &lt;
      </button>
      {pages.map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="userblog-page-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`userblog-page-btn${p === page ? ' active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </button>
        )
      )}
      <button
        className="userblog-page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        &gt;
      </button>
    </div>
  );
}

export default function UserBlog() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [profileImg, setProfileImg] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [activeSubCatId, setActiveSubCatId] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [neighborStatus, setNeighborStatus] = useState(null);
  const [neighborId, setNeighborId] = useState(null);
  const [neighborLoading, setNeighborLoading] = useState(false);

  const isMyBlog = currentUser?.id === Number(userId);

  // 검색 디바운스 (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // userId 변경 시 메타 정보 초기화 및 재조회
  useEffect(() => {
    setNickname('');
    setProfileImg(null);
    setCategories([]);
    setActiveCatId(null);
    setActiveSubCatId(null);
    setSearchInput('');
    setSearch('');
    setPage(0);
    setTotalPages(0);
    setTotalElements(0);
    setNeighborStatus(null);
    setNeighborId(null);
    setMetaLoading(true);

    const fetchMeta = async () => {
      try {
        const [catsRes, userRes] = await Promise.all([
          categoryApi.getCategories(userId),
          userApi.getUserInfo(userId),
        ]);
        setCategories(catsRes.data ?? []);
        setNickname(userRes.data?.nickname ?? '');
        setProfileImg(userRes.data?.profileImg ?? null);
      } finally {
        setMetaLoading(false);
      }

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

    fetchMeta();
  }, [userId, currentUser.id, isMyBlog]);

  // 검색/페이지/카테고리 변경 시 포스트 재조회
  useEffect(() => {
    const catId = activeSubCatId ?? activeCatId ?? null;
    setPostsLoading(true);
    postApi.getUserPosts(userId, search, catId, page)
      .then((res) => {
        setPosts(res.content ?? []);
        setTotalPages(res.totalPages ?? 0);
        setTotalElements(res.totalElements ?? 0);
      })
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [userId, search, page, activeCatId, activeSubCatId]);

  const handleCatClick = (catId) => {
    setActiveCatId(catId);
    setActiveSubCatId(null);
    setPage(0);
  };

  const handleSubCatClick = (subCatId) => {
    setActiveSubCatId(subCatId);
    setPage(0);
  };

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
  const activeSubCats = activeCatId ? categories.filter((c) => c.parentId === activeCatId) : [];

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
        {!metaLoading && categories.length > 0 && (
          <div className="userblog-cat-section">
            <div className="userblog-cat-bar">
              <button
                className={`userblog-cat-btn${!activeCatId ? ' active' : ''}`}
                onClick={() => { setActiveCatId(null); setActiveSubCatId(null); setPage(0); }}
              >
                전체
                {!activeCatId && <span className="cat-count">{totalElements}</span>}
              </button>
              {topLevelCats.map((cat) => (
                <button
                  key={cat.id}
                  className={`userblog-cat-btn${activeCatId === cat.id ? ' active' : ''}`}
                  onClick={() => handleCatClick(cat.id)}
                >
                  {cat.name}
                  {activeCatId === cat.id && <span className="cat-count">{totalElements}</span>}
                </button>
              ))}
            </div>

            {activeSubCats.length > 0 && (
              <div className="userblog-subcat-bar">
                <button
                  className={`userblog-subcat-btn${!activeSubCatId ? ' active' : ''}`}
                  onClick={() => handleSubCatClick(null)}
                >
                  전체
                </button>
                {activeSubCats.map((sub) => (
                  <button
                    key={sub.id}
                    className={`userblog-subcat-btn${activeSubCatId === sub.id ? ' active' : ''}`}
                    onClick={() => handleSubCatClick(sub.id)}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 검색창 */}
        <div className="userblog-search-bar">
          <div className="userblog-search-wrap">
            <span className="userblog-search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className="userblog-search-input"
              type="text"
              placeholder="제목, 내용 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                className="userblog-search-clear"
                onClick={() => setSearchInput('')}
                aria-label="검색 초기화"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 포스트 목록 */}
        {postsLoading ? (
          <div className="userblog-status">
            <div className="loading-spinner" />
            <span>불러오는 중...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="userblog-status">
            {search
              ? `"${search}"에 대한 검색 결과가 없습니다.`
              : activeCatId
              ? '해당 카테고리의 게시글이 없습니다.'
              : '게시글이 없습니다.'}
          </div>
        ) : (
          <>
            <div className="userblog-grid">
              {posts.map((post) => {
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
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </main>
    </div>
  );
}
