import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as postApi from '../api/postApi';
import * as neighborApi from '../api/neighborApi';
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

  const [neighborStatus, setNeighborStatus] = useState(null); // NONE | PENDING_SENT | PENDING_RECEIVED | ACCEPTED
  const [neighborId, setNeighborId] = useState(null);
  const [neighborLoading, setNeighborLoading] = useState(false);

  const isMyBlog = currentUser?.id === Number(userId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, statusRes] = await Promise.all([
          postApi.getUserPosts(userId),
          isMyBlog ? Promise.resolve(null) : neighborApi.getStatusWith(currentUser.id, userId),
        ]);
        const data = postsRes.data ?? [];
        setPosts(data);
        if (data.length > 0) setNickname(data[0].nickname ?? '');
        if (statusRes) {
          setNeighborStatus(statusRes.data.status);
          setNeighborId(statusRes.data.neighborId);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, currentUser.id, isMyBlog]);

  const handleNeighborBtn = async () => {
    if (neighborLoading) return;
    setNeighborLoading(true);
    try {
      if (neighborStatus === 'NONE') {
        const res = await neighborApi.sendRequest(currentUser.id, Number(userId));
        setNeighborStatus('PENDING_SENT');
        setNeighborId(res.data.id);
      } else if (neighborStatus === 'PENDING_SENT') {
        await neighborApi.deleteNeighbor(currentUser.id, neighborId);
        setNeighborStatus('NONE');
        setNeighborId(null);
      } else if (neighborStatus === 'PENDING_RECEIVED') {
        await neighborApi.updateStatus(currentUser.id, neighborId, 'ACCEPTED');
        setNeighborStatus('ACCEPTED');
      } else if (neighborStatus === 'ACCEPTED') {
        if (!window.confirm('이웃을 끊으시겠습니까?')) return;
        await neighborApi.deleteNeighbor(currentUser.id, neighborId);
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

  return (
    <div className="userblog-page">
      <header className="userblog-header">
        <button className="userblog-back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          뒤로
        </button>
        <div className="userblog-title-wrap">
          <div className="userblog-avatar">{nickname?.[0] ?? '?'}</div>
          <h1 className="userblog-title">{nickname ? `${nickname}의 블로그` : '블로그'}</h1>
        </div>
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

      <main className="userblog-main">
        {loading ? (
          <div className="userblog-status">
            <div className="loading-spinner" />
            <span>불러오는 중...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="userblog-status">게시글이 없습니다.</div>
        ) : (
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
        )}
      </main>
    </div>
  );
}
