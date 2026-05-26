import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { useAuth } from '../context/AuthContext';
import * as postApi from '../api/postApi';
import * as commentApi from '../api/commentApi';
import Avatar from '../components/Avatar';
import './PostDetail.css';

marked.setOptions({ breaks: true, gfm: true });

const BASE_URL = 'http://localhost:8081';

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [postLoading, setPostLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const fetchPost = useCallback(async () => {
    try {
      const [postRes, likedRes] = await Promise.all([
        postApi.getOnePost(postId),
        postApi.getLikedPostIds(currentUser.id),
      ]);
      setPost(postRes.data);
      setLiked(new Set(likedRes.data ?? []).has(Number(postId)));
    } catch {
      alert('게시글을 불러올 수 없습니다.');
      navigate('/home');
    } finally {
      setPostLoading(false);
    }
  }, [postId, currentUser.id, navigate]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await commentApi.getComments(postId);
      setComments(res.data ?? []);
    } finally {
      setCommentLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleLike = async () => {
    if (liked) {
      setLiked(false);
      setPost((p) => ({ ...p, likeCount: p.likeCount - 1 }));
      try { await postApi.unlikePost(currentUser.id, postId); }
      catch { setLiked(true); setPost((p) => ({ ...p, likeCount: p.likeCount + 1 })); }
    } else {
      setLiked(true);
      setPost((p) => ({ ...p, likeCount: p.likeCount + 1 }));
      try { await postApi.likePost(currentUser.id, postId); }
      catch (err) {
        // 409: 이미 좋아요 상태 → 롤백 없이 liked=true 유지
        if (!err.message?.includes('이미 좋아요')) {
          setLiked(false);
          setPost((p) => ({ ...p, likeCount: p.likeCount - 1 }));
        }
      }
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await commentApi.createComment(currentUser.id, postId, newComment.trim());
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      alert(err.message || '댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingContent.trim()) return;
    try {
      const res = await commentApi.updateComment(currentUser.id, commentId, editingContent.trim());
      setComments((prev) => prev.map((c) => (c.id === commentId ? res.data : c)));
      cancelEdit();
    } catch (err) {
      alert(err.message || '댓글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await commentApi.deleteComment(currentUser.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.message || '댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const goToAuthorBlog = () => {
    if (post && post.userId !== currentUser?.id) {
      navigate(`/blog/${post.userId}`);
    }
  };

  if (postLoading) {
    return (
      <div className="detail-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!post) return null;

  const imageUrl = post.imagePath
    ? (post.imagePath.startsWith('http') ? post.imagePath : `${BASE_URL}${post.imagePath}`)
    : null;

  return (
    <div className="detail-page">
      <header className="detail-header">
        <button className="detail-back" onClick={() => navigate('/home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </button>
      </header>

      <main className="detail-main">
        {imageUrl && (
          <div className="detail-hero">
            <img src={imageUrl} alt={post.title} className="detail-hero-img" />
          </div>
        )}

        <div className="detail-content-wrap">
          <h1 className="detail-title">{post.title}</h1>

          <div className="detail-meta">
            <div
              className={`detail-author${post.userId !== currentUser?.id ? ' clickable' : ''}`}
              onClick={goToAuthorBlog}
            >
              <Avatar profileImg={post.profileImg} nickname={post.nickname} className="detail-avatar" />
              <div>
                <span className="detail-author-name">{post.nickname ?? '알 수 없음'}</span>
                <span className="detail-date">{formatDate(post.createdAt)}</span>
              </div>
            </div>

            <button
              className={`detail-like${liked ? ' liked' : ''}`}
              onClick={handleLike}
            >
              <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {post.likeCount}
            </button>
          </div>

          <div
            className="detail-body markdown-body"
            dangerouslySetInnerHTML={{ __html: marked(post.content || '') }}
          />
        </div>

        {/* 댓글 */}
        <div className="detail-comments">
          <h2 className="comments-title">댓글 {comments.length}</h2>

          {commentLoading ? (
            <div className="comment-loading">
              <div className="loading-spinner" />
            </div>
          ) : (
            <ul className="comment-list">
              {comments.length === 0 && (
                <li className="comment-empty">첫 댓글을 남겨보세요!</li>
              )}
              {comments.map((c) => (
                <li key={c.id} className="comment-item">
                  <div className="comment-header">
                    <Avatar profileImg={c.profileImg} nickname={c.nickname} className="comment-avatar" />
                    <span className="comment-author">{c.nickname ?? '알 수 없음'}</span>
                    <span className="comment-date">{formatDate(c.createdAt)}</span>
                    {c.userId === currentUser?.id && editingId !== c.id && (
                      <div className="comment-actions">
                        <button className="btn-comment-edit" onClick={() => startEdit(c)}>수정</button>
                        <button className="btn-comment-delete" onClick={() => handleDeleteComment(c.id)}>삭제</button>
                      </div>
                    )}
                  </div>

                  {editingId === c.id ? (
                    <div className="comment-edit-form">
                      <textarea
                        className="comment-edit-input"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                      />
                      <div className="comment-edit-btns">
                        <button className="btn-comment-save" onClick={() => handleUpdateComment(c.id)}>저장</button>
                        <button className="btn-comment-cancel" onClick={cancelEdit}>취소</button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-body">{c.content}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form className="comment-form" onSubmit={handleSubmitComment}>
            <textarea
              className="comment-input"
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <button
              type="submit"
              className="btn-comment-submit"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? '등록 중...' : '댓글 등록'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
