import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userApi from '../api/userApi';
import { uploadFile } from '../api/http';
import './ProfileEdit.css';

const BASE_URL = 'http://localhost:8081';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { currentUser, logout, refreshUser } = useAuth();

  const [nickname, setNickname] = useState(currentUser?.nickname ?? '');
  const [nicknameVal, setNicknameVal] = useState({ status: '', message: '' });
  const nicknameTimer = useRef(null);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwdConfirm, setNewPwdConfirm] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const imgInputRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);

  const profileImgUrl = currentUser?.profileImg
    ? (currentUser.profileImg.startsWith('http') ? currentUser.profileImg : `${BASE_URL}${currentUser.profileImg}`)
    : null;

  const handleImgChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const res = await uploadFile('/api/upload/image', file);
      await userApi.updateProfileImg(res.data.url);
      await refreshUser();
    } catch (err) {
      alert(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setImgUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  };

  // ── 닉네임 중복 확인 ─────────────────────────────────────────
  const checkNickname = async (value) => {
    const v = value ?? nickname;
    if (!v || v === currentUser?.nickname) {
      setNicknameVal({ status: '', message: '' });
      return;
    }
    if (v.length < 2 || v.length > 10) {
      setNicknameVal({ status: 'error', message: '닉네임은 2-10자 사이로 입력해주세요.' });
      return;
    }
    setNicknameVal({ status: 'checking', message: '확인 중...' });
    try {
      const res = await userApi.checkNickname(v);
      if (res.data) {
        setNicknameVal({ status: 'error', message: '이미 사용 중인 닉네임입니다.' });
      } else {
        setNicknameVal({ status: 'success', message: '사용 가능한 닉네임입니다.' });
      }
    } catch {
      setNicknameVal({ status: 'error', message: '확인 중 오류가 발생했습니다.' });
    }
  };

  const onNicknameChange = (e) => {
    const v = e.target.value;
    setNickname(v);
    setNicknameVal({ status: '', message: '' });
    clearTimeout(nicknameTimer.current);
    if (v && v !== currentUser?.nickname && v.length >= 2) {
      nicknameTimer.current = setTimeout(() => checkNickname(v), 500);
    }
  };

  // ── 정보 수정 제출 ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPwd) { alert('현재 비밀번호를 입력해주세요.'); return; }
    if (nicknameVal.status === 'error') { alert('닉네임을 확인해주세요.'); return; }
    if (newPwd && newPwd !== newPwdConfirm) { alert('새 비밀번호가 일치하지 않습니다.'); return; }
    if (newPwd && newPwd.length < 4) { alert('새 비밀번호는 4자 이상이어야 합니다.'); return; }

    const body = { currentPwd };
    if (nickname && nickname !== currentUser?.nickname) body.nickname = nickname;
    if (newPwd) body.newPwd = newPwd;

    if (!body.nickname && !body.newPwd) { alert('변경할 내용이 없습니다.'); return; }

    setSubmitting(true);
    try {
      await userApi.updateInfo(body);
      await refreshUser();
      alert('정보가 수정되었습니다.');
      setCurrentPwd('');
      setNewPwd('');
      setNewPwdConfirm('');
      setNicknameVal({ status: '', message: '' });
    } catch (err) {
      alert(err.message || '수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 회원 탈퇴 ────────────────────────────────────────────────
  const handleWithdraw = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    setWithdrawing(true);
    try {
      await userApi.withdraw();
      await logout();
      navigate('/login');
    } catch (err) {
      alert(err.message || '탈퇴 중 오류가 발생했습니다.');
      setWithdrawing(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="profile-back" onClick={() => navigate('/home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          홈
        </button>
        <h1 className="profile-title">개인정보 수정</h1>
      </header>

      <main className="profile-main">

        {/* 현재 정보 */}
        <div className="profile-card info-card">
          <div className="profile-avatar-wrap" onClick={() => !imgUploading && imgInputRef.current?.click()} title="프로필 사진 변경">
            <input
              type="file"
              accept="image/*"
              ref={imgInputRef}
              style={{ display: 'none' }}
              onChange={handleImgChange}
            />
            {profileImgUrl ? (
              <img src={profileImgUrl} alt="프로필" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-lg">{currentUser?.nickname?.[0] ?? '?'}</div>
            )}
            <div className={`profile-avatar-overlay${imgUploading ? ' uploading' : ''}`}>
              {imgUploading ? '...' : '📷'}
            </div>
          </div>
          <div>
            <p className="info-nickname">{currentUser?.nickname}</p>
            <p className="info-id">@{currentUser?.loginId}</p>
            <p className="info-email">{currentUser?.email}</p>
          </div>
        </div>

        {/* 정보 수정 폼 */}
        <form className="profile-card" onSubmit={handleSubmit}>
          <h2 className="profile-section-title">정보 수정</h2>

          <div className="profile-field">
            <label className="profile-label">닉네임</label>
            <input
              type="text"
              className="profile-input"
              value={nickname}
              onChange={onNicknameChange}
              onBlur={() => checkNickname()}
              maxLength={10}
              placeholder="닉네임 (2-10자)"
            />
            {nicknameVal.message && (
              <p className={`profile-val-msg ${nicknameVal.status}`}>{nicknameVal.message}</p>
            )}
          </div>

          <div className="profile-divider" />

          <div className="profile-field">
            <label className="profile-label">
              현재 비밀번호 <span className="required">*</span>
            </label>
            <input
              type="password"
              className="profile-input"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="변경 시 현재 비밀번호 필수"
            />
          </div>

          <div className="profile-field">
            <label className="profile-label">새 비밀번호 <span className="optional">(선택)</span></label>
            <input
              type="password"
              className="profile-input"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="변경하지 않으려면 비워두세요"
            />
          </div>

          {newPwd && (
            <div className="profile-field">
              <label className="profile-label">새 비밀번호 확인</label>
              <input
                type="password"
                className={`profile-input${newPwdConfirm && newPwd !== newPwdConfirm ? ' input-error' : ''}`}
                value={newPwdConfirm}
                onChange={(e) => setNewPwdConfirm(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
              {newPwdConfirm && newPwd !== newPwdConfirm && (
                <p className="profile-val-msg error">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn-profile-save"
            disabled={submitting || nicknameVal.status === 'error'}
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </form>

        {/* 회원 탈퇴 */}
        <div className="profile-card danger-card">
          <h2 className="profile-section-title danger-title">계정 관리</h2>
          <p className="danger-desc">탈퇴 시 모든 게시글, 댓글, 이웃 관계가 삭제되며 복구할 수 없습니다.</p>
          <button
            className="btn-withdraw"
            onClick={handleWithdraw}
            disabled={withdrawing}
          >
            {withdrawing ? '처리 중...' : '회원 탈퇴'}
          </button>
        </div>

      </main>
    </div>
  );
}
