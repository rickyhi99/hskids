import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as categoryApi from '../api/categoryApi';
import './CategoryManage.css';

export default function CategoryManage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 추가 폼 상태
  const [newName, setNewName] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [adding, setAdding] = useState(false);

  // 인라인 수정 상태
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories(currentUser.id);
      setCategories(res.data ?? []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentUser.id]);

  const topLevel = categories.filter((c) => !c.parentId);
  const children = (parentId) => categories.filter((c) => c.parentId === parentId);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim() || adding) return;
    setAdding(true);
    try {
      const maxOrder = categories
        .filter((c) => (newParentId ? c.parentId === Number(newParentId) : !c.parentId))
        .reduce((max, c) => Math.max(max, c.orderNum), 0);
      await categoryApi.createCategory({
        name: newName.trim(),
        parentId: newParentId ? Number(newParentId) : null,
        orderNum: maxOrder + 1,
      });
      setNewName('');
      setNewParentId('');
      await fetchCategories();
    } catch (err) {
      alert(err.message || '카테고리 추가에 실패했습니다.');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
  };

  const handleSave = async (cat) => {
    if (!editName.trim() || saving) return;
    setSaving(true);
    try {
      await categoryApi.updateCategory(cat.id, {
        name: editName.trim(),
        orderNum: cat.orderNum,
      });
      setEditId(null);
      await fetchCategories();
    } catch (err) {
      alert(err.message || '수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (cat, direction) => {
    if (reordering) return;
    // 같은 레벨(같은 parentId)의 형제를 orderNum 오름차순으로 정렬
    const siblings = categories
      .filter((c) => c.parentId === cat.parentId)
      .sort((a, b) => a.orderNum - b.orderNum);
    const idx = siblings.findIndex((c) => c.id === cat.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    const target = siblings[swapIdx];
    setReordering(true);
    try {
      await Promise.all([
        categoryApi.updateCategory(cat.id,    { name: cat.name,    orderNum: target.orderNum }),
        categoryApi.updateCategory(target.id, { name: target.name, orderNum: cat.orderNum }),
      ]);
      await fetchCategories();
    } catch (err) {
      alert(err.message || '순서 변경에 실패했습니다.');
    } finally {
      setReordering(false);
    }
  };

  const handleDelete = async (cat) => {
    const subCount = children(cat.id).length;
    const msg = subCount > 0
      ? `"${cat.name}" 카테고리를 삭제하면 하위 ${subCount}개 카테고리의 상위 연결이 해제됩니다. 삭제하시겠습니까?`
      : `"${cat.name}" 카테고리를 삭제하시겠습니까?`;
    if (!window.confirm(msg)) return;
    try {
      await categoryApi.deleteCategory(cat.id);
      await fetchCategories();
    } catch (err) {
      alert(err.message || '삭제에 실패했습니다.');
    }
  };

  const renderCategory = (cat, depth = 0) => {
    const siblings = categories
      .filter((c) => c.parentId === cat.parentId)
      .sort((a, b) => a.orderNum - b.orderNum);
    const idx = siblings.findIndex((c) => c.id === cat.id);
    const isFirst = idx === 0;
    const isLast = idx === siblings.length - 1;

    return (
      <div key={cat.id} className={`cat-item depth-${depth}`}>
        <div className="cat-item-inner">
          {depth > 0 && <span className="cat-indent-icon">└</span>}
          {editId === cat.id ? (
            <div className="cat-edit-row">
              <input
                className="cat-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(cat);
                  if (e.key === 'Escape') cancelEdit();
                }}
                autoFocus
              />
              <button className="btn-cat btn-cat-save" onClick={() => handleSave(cat)} disabled={saving}>
                저장
              </button>
              <button className="btn-cat btn-cat-cancel" onClick={cancelEdit}>
                취소
              </button>
            </div>
          ) : (
            <div className="cat-display-row">
              {/* 순서 이동 버튼 */}
              <div className="cat-order-btns">
                <button
                  className="btn-order"
                  onClick={() => handleMove(cat, 'up')}
                  disabled={isFirst || reordering}
                  title="위로"
                >
                  ▲
                </button>
                <button
                  className="btn-order"
                  onClick={() => handleMove(cat, 'down')}
                  disabled={isLast || reordering}
                  title="아래로"
                >
                  ▼
                </button>
              </div>
              <span className="cat-name">{cat.name}</span>
              <div className="cat-actions">
                <button className="btn-cat btn-cat-edit" onClick={() => startEdit(cat)}>수정</button>
                <button className="btn-cat btn-cat-delete" onClick={() => handleDelete(cat)}>삭제</button>
              </div>
            </div>
          )}
        </div>
        {children(cat.id).map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="catmgr-page">
      <header className="catmgr-header">
        <button className="catmgr-back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          뒤로
        </button>
        <h1 className="catmgr-title">카테고리 관리</h1>
      </header>

      <main className="catmgr-main">
        {/* 카테고리 추가 */}
        <div className="catmgr-card">
          <h2 className="catmgr-section-title">새 카테고리 추가</h2>
          <form className="catmgr-add-form" onSubmit={handleAdd}>
            <div className="catmgr-field">
              <label className="catmgr-label">카테고리 이름 <span className="required">*</span></label>
              <input
                className="catmgr-input"
                type="text"
                placeholder="이름을 입력하세요"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={30}
              />
            </div>
            <div className="catmgr-field">
              <label className="catmgr-label">상위 카테고리 <span className="optional">선택</span></label>
              <select
                className="catmgr-input catmgr-select"
                value={newParentId}
                onChange={(e) => setNewParentId(e.target.value)}
              >
                <option value="">없음 (최상위)</option>
                {topLevel.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn-catmgr-add"
              disabled={!newName.trim() || adding}
            >
              {adding ? '추가 중...' : '+ 추가'}
            </button>
          </form>
        </div>

        {/* 카테고리 목록 */}
        <div className="catmgr-card">
          <h2 className="catmgr-section-title">
            내 카테고리
            <span className="catmgr-count">{categories.length}개</span>
          </h2>

          {loading ? (
            <div className="catmgr-status">
              <div className="loading-spinner" />
              <span>불러오는 중...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="catmgr-status catmgr-empty">
              아직 카테고리가 없습니다.<br />위에서 추가해보세요.
            </div>
          ) : (
            <div className="cat-list">
              {topLevel.map((cat) => renderCategory(cat, 0))}
              {/* 부모가 삭제된 고아 카테고리 처리 */}
              {categories
                .filter((c) => c.parentId && !categories.find((p) => p.id === c.parentId))
                .map((cat) => renderCategory(cat, 0))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
