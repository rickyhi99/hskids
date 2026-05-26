import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { marked } from 'marked';
import { useAuth } from '../context/AuthContext';
import * as postApi from '../api/postApi';
import * as categoryApi from '../api/categoryApi';
import { uploadFile } from '../api/http';
import useTheme from '../hooks/useTheme';
import RabbitChatbot from '../components/RabbitChatbot';
import './Write.css';

marked.setOptions({ breaks: true, gfm: true });

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: '전체 공개' },
  { value: 'NEIGHBOR', label: '이웃만' },
  { value: 'PRIVATE', label: '비공개' },
];

const MODES = [
  { value: 'edit', label: '에디터' },
  { value: 'split', label: '분할' },
  { value: 'preview', label: '미리보기' },
];

export default function Write() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [dark, toggleTheme] = useTheme();
  const [editorMode, setEditorMode] = useState('split');
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    categoryApi.getCategories(currentUser.id)
      .then((res) => setCategories(res.data ?? []))
      .catch(() => setCategories([]));
  }, [currentUser?.id]);

  // 수정 모드: navigate('/write', { state: { post } }) 로 진입
  const editPost = location.state?.post ?? null;
  const isEditMode = Boolean(editPost);

  const [form, setForm] = useState({
    title: editPost?.title ?? '',
    content: editPost?.content ?? '',
    categoryId: editPost?.categoryId ?? '',
    imagePath: editPost?.imagePath ?? '',
    visibility: editPost?.visibility ?? 'PUBLIC',
  });
  const [imagePreview, setImagePreview] = useState(editPost?.imagePath ? `http://localhost:8081${editPost.imagePath}` : null);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setImageUploading(true);
    try {
      const res = await uploadFile('/api/upload/image', file);
      setForm((prev) => ({ ...prev, imagePath: res.data.url }));
    } catch (err) {
      alert(err.message || '이미지 업로드에 실패했습니다.');
      setImagePreview(null);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setForm((prev) => ({ ...prev, imagePath: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const body = {
        title: form.title.trim(),
        content: form.content,
        categoryId: form.categoryId || null,
        visibility: form.visibility,
        imagePath: form.imagePath || null,
      };
      if (isEditMode) {
        await postApi.updatePost(currentUser.id, editPost.id, body);
      } else {
        await postApi.createPost(currentUser.id, body);
      }
      navigate('/home');
    } catch (err) {
      alert(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = form.title.trim() && form.content.trim() && !imageUploading;

  const renderedMarkdown = useMemo(
    () => (form.content ? marked(form.content) : ''),
    [form.content]
  );

  return (
    <div className="write-page">
      <header className="write-header">
        <button className="btn-back" type="button" onClick={() => navigate('/home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </button>
        <h1 className="write-header-title">{isEditMode ? '글 수정' : '새 글 작성'}</h1>
        <div className="write-header-actions">
          <button className="btn-theme" type="button" onClick={toggleTheme} title={dark ? '라이트 모드' : '다크 모드'}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            className="btn-publish"
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            {submitting ? '저장 중...' : isEditMode ? '수정 완료' : '발행'}
          </button>
        </div>
      </header>

      <main className="write-main">
        <form className="write-form" onSubmit={handleSubmit}>

          {/* 공개 범위 + 카테고리 */}
          <div className="write-card">
            <div className="write-section">
              <span className="section-label">공개 범위</span>
              <div className="chip-group">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`chip ${form.visibility === opt.value ? 'chip-active' : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, visibility: opt.value }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-divider" />

            <div className="write-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span className="section-label" style={{ marginBottom: 0 }}>
                  카테고리 <span className="optional">선택</span>
                </span>
                <button
                  type="button"
                  className="chip"
                  style={{ fontSize: '0.78rem', padding: '3px 10px' }}
                  onClick={() => navigate('/categories')}
                >
                  카테고리 관리
                </button>
              </div>
              <div className="chip-group">
                {categories.length === 0 ? (
                  <span className="optional" style={{ fontSize: '0.85rem' }}>등록된 카테고리가 없습니다</span>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`chip ${Number(form.categoryId) === cat.id ? 'chip-active' : ''}`}
                      onClick={() => setForm((prev) => ({ ...prev, categoryId: cat.id }))}
                    >
                      {cat.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 제목 */}
          <div className="write-card">
            <div className="write-section">
              <span className="section-label">
                제목 <span className="required">*</span>
              </span>
              <div className="input-title-wrap">
                <input
                  type="text"
                  className="input-title"
                  placeholder="제목을 입력하세요"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  maxLength={100}
                />
                <span className="char-count">{form.title.length} / 100</span>
              </div>
            </div>
          </div>

          {/* 대표 이미지 */}
          <div className="write-card">
            <div className="write-section">
              <span className="section-label">
                대표 이미지 <span className="optional">선택</span>
              </span>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="image-preview-wrap">
                  <img src={imagePreview} alt="미리보기" className="image-preview" />
                  {imageUploading && <div className="image-uploading-overlay">업로드 중...</div>}
                  <button type="button" className="btn-remove-image" onClick={removeImage} disabled={imageUploading}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-image-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>이미지 추가</span>
                </button>
              )}
            </div>
          </div>

          {/* 마크다운 에디터 */}
          <div className="write-card">
            <div className="write-section">
              <div className="editor-toolbar">
                <span className="section-label">
                  내용 <span className="required">*</span>
                </span>
                <div className="editor-mode-tabs">
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      className={`tab-btn ${editorMode === m.value ? 'active' : ''}`}
                      onClick={() => setEditorMode(m.value)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <span className="editor-hint">마크다운 지원</span>
              </div>

              <div className={`editor-pane mode-${editorMode}`}>
                <div className="edit-panel">
                  <div className="panel-label">MARKDOWN</div>
                  <textarea
                    className="input-content"
                    placeholder={`# 제목\n\n내용을 마크다운으로 작성하세요...\n\n**굵게**, *기울임*, \`코드\`, > 인용구`}
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div className="preview-panel">
                  <div className="panel-label">PREVIEW</div>
                  {renderedMarkdown ? (
                    <div
                      className="markdown-body"
                      dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                    />
                  ) : (
                    <p className="markdown-empty">내용을 입력하면 미리보기가 표시됩니다</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="write-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/home')}>
              취소
            </button>
            <button type="submit" className="btn-submit" disabled={!isValid || submitting}>
              {submitting ? '저장 중...' : isEditMode ? '수정 완료' : '발행하기'}
            </button>
          </div>

        </form>
      </main>

      <RabbitChatbot />
    </div>
  );
}
