import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RabbitChatbot from '../components/RabbitChatbot';
import './Write.css';

const CATEGORIES = [
  { id: 1, name: 'React' },
  { id: 2, name: 'CSS' },
  { id: 3, name: 'TypeScript' },
  { id: 4, name: 'Git' },
  { id: 5, name: '성능' },
  { id: 6, name: '개발 문화' },
  { id: 7, name: '일상' },
];

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: '전체 공개' },
  { value: 'FOLLOWERS', label: '팔로워만' },
  { value: 'PRIVATE', label: '비공개' },
];

export default function Write() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    categoryId: '',
    imagePath: '',
    visibility: 'PUBLIC',
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, imagePath: `/static/img/${file.name}` }));
  };

  const removeImage = () => {
    setImagePreview(null);
    setForm((prev) => ({ ...prev, imagePath: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    // TODO: API 연동
    console.log('submit', form);
    navigate('/home');
  };

  const isValid = form.title.trim() && form.content.trim() && form.categoryId !== '';

  return (
    <div className="write-page">
      <header className="write-header">
        <button className="btn-back" type="button" onClick={() => navigate('/home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </button>
        <h1 className="write-header-title">새 글 작성</h1>
        <button
          className="btn-publish"
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          발행
        </button>
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
              <span className="section-label">
                카테고리 <span className="required">*</span>
              </span>
              <div className="chip-group">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`chip ${form.categoryId === cat.id ? 'chip-active' : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, categoryId: cat.id }))}
                  >
                    {cat.name}
                  </button>
                ))}
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
                  <button type="button" className="btn-remove-image" onClick={removeImage}>
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

          {/* 내용 */}
          <div className="write-card">
            <div className="write-section">
              <span className="section-label">
                내용 <span className="required">*</span>
              </span>
              <textarea
                className="input-content"
                placeholder="내용을 입력하세요..."
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="write-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/home')}>
              취소
            </button>
            <button type="submit" className="btn-submit" disabled={!isValid}>
              발행하기
            </button>
          </div>

        </form>
      </main>

      <RabbitChatbot />
    </div>
  );
}
