import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RabbitAnimation from '../components/login/RabbitAnimation';
import { useAuth } from '../context/AuthContext';
import * as userApi from '../api/userApi';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { validate, confirmLogin } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [pwFocused, setPwFocused] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const pendingUser = useRef(null);

  // 회원가입 폼
  const [form, setForm] = useState({
    regAccount: '', regPw: '', regEmail: '', regUserName: '',
  });
  const [accountVal, setAccountVal] = useState({ status: '', message: '' });
  const [emailVal, setEmailVal] = useState({ status: '', message: '' });
  const [usernameVal, setUsernameVal] = useState({ status: '', message: '' });
  const [registerLoading, setRegisterLoading] = useState(false);

  const accountTimerRef = useRef(null);
  const emailTimerRef = useRef(null);
  const usernameTimerRef = useRef(null);

  const isFormValid =
    form.regAccount && form.regPw && form.regEmail && form.regUserName &&
    accountVal.status === 'success' &&
    emailVal.status === 'success' &&
    usernameVal.status === 'success';

  // ── 로그인 ──────────────────────────────────────────────────
  const submitLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    try {
      const user = await validate(loginId, loginPw);
      pendingUser.current = user;
      setLoginSuccess(true);
    } catch (e) {
      alert(e.message || '계정 정보가 올바르지 않습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const onLoginKeyDown = (e) => {
    if (e.key === 'Enter') submitLogin();
  };

  const onAnimationEnd = () => {
    if (pendingUser.current) {
      confirmLogin(pendingUser.current);
      navigate('/home');
    }
  };

  // ── 아이디 중복 검사 (API) ───────────────────────────────────
  const checkAccount = async (value) => {
    const v = value ?? form.regAccount;
    if (!v) return;
    if (v.length < 4 || v.length > 20) {
      setAccountVal({ status: 'error', message: '아이디는 4-20자 사이로 입력해주세요.' });
      return;
    }
    setAccountVal({ status: 'checking', message: '확인 중...' });
    try {
      const res = await userApi.checkId(v);
      if (res.data) {
        setAccountVal({ status: 'error', message: '이미 사용 중인 아이디입니다.' });
      } else {
        setAccountVal({ status: 'success', message: '사용 가능한 아이디입니다.' });
      }
    } catch {
      setAccountVal({ status: 'error', message: '확인 중 오류가 발생했습니다.' });
    }
  };

  const onAccountInput = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, regAccount: val }));
    setAccountVal({ status: '', message: '' });
    clearTimeout(accountTimerRef.current);
    if (val.length >= 4) {
      accountTimerRef.current = setTimeout(() => checkAccount(val), 500);
    }
  };

  // ── 이메일 중복 검사 (API) ───────────────────────────────────
  const checkEmail = async (value) => {
    const v = value ?? form.regEmail;
    if (!v) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) {
      setEmailVal({ status: 'error', message: '올바른 이메일 형식이 아닙니다.' });
      return;
    }
    setEmailVal({ status: 'checking', message: '확인 중...' });
    try {
      const res = await userApi.checkEmail(v);
      if (res.data) {
        setEmailVal({ status: 'error', message: '이미 사용 중인 이메일입니다.' });
      } else {
        setEmailVal({ status: 'success', message: '사용 가능한 이메일입니다.' });
      }
    } catch {
      setEmailVal({ status: 'error', message: '확인 중 오류가 발생했습니다.' });
    }
  };

  const onEmailInput = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, regEmail: val }));
    setEmailVal({ status: '', message: '' });
    clearTimeout(emailTimerRef.current);
    if (val.includes('@')) {
      emailTimerRef.current = setTimeout(() => checkEmail(val), 500);
    }
  };

  // ── 닉네임 검사 (길이만, API 없음) ──────────────────────────
  const checkUsername = (value) => {
    const v = value ?? form.regUserName;
    if (!v) return;
    if (v.length < 2 || v.length > 10) {
      setUsernameVal({ status: 'error', message: '닉네임은 2-10자 사이로 입력해주세요.' });
    } else {
      setUsernameVal({ status: 'success', message: '사용 가능한 닉네임입니다.' });
    }
  };

  const onUsernameInput = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, regUserName: val }));
    setUsernameVal({ status: '', message: '' });
    clearTimeout(usernameTimerRef.current);
    if (val.length >= 2) {
      usernameTimerRef.current = setTimeout(() => checkUsername(val), 300);
    }
  };

  // ── 회원가입 ─────────────────────────────────────────────────
  const registerUser = async () => {
    if (!isFormValid || registerLoading) return;
    setRegisterLoading(true);
    try {
      await userApi.join(form.regAccount, form.regPw, form.regEmail, form.regUserName);
      alert('회원가입에 성공했습니다.');
      setForm({ regAccount: '', regPw: '', regEmail: '', regUserName: '' });
      setAccountVal({ status: '', message: '' });
      setEmailVal({ status: '', message: '' });
      setUsernameVal({ status: '', message: '' });
      setIsRegistering(false);
    } catch (e) {
      alert(e.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const toggleForm = () => {
    setTimeout(() => {
      setIsRegistering((v) => !v);
      setAccountVal({ status: '', message: '' });
      setEmailVal({ status: '', message: '' });
      setUsernameVal({ status: '', message: '' });
    }, 50);
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/img/background_image.png)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {!isRegistering && (
        <RabbitAnimation
          idLength={loginId.length}
          pwFocused={pwFocused}
          loginSuccess={loginSuccess}
          onAnimationEnd={onAnimationEnd}
        />
      )}

      <div className={`login-panel${isRegistering ? ' registering' : ''}`}>
        {!isRegistering ? (
          <div className="panel-content" key="login">
            <h1>Login</h1>
            <label htmlFor="loginId">
              <span>아이디</span>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                onKeyDown={onLoginKeyDown}
                placeholder="아이디를 입력하세요"
              />
            </label>
            <label htmlFor="loginPw">
              <span>비밀번호</span>
              <input
                id="loginPw"
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                onKeyDown={onLoginKeyDown}
                placeholder="비밀번호를 입력하세요"
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
              />
            </label>
            <button className="btn-login" onClick={submitLogin} disabled={loginLoading}>
              {loginLoading ? '로그인 중...' : 'Login'}
            </button>
            <div className="toggle-link-container">
              <div className="toggle-link">
                <a href="#!" onClick={(e) => { e.preventDefault(); toggleForm(); }}>
                  회원이 아니라면? 회원가입
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel-content" key="register">
            <button className="btn-back" onClick={toggleForm}>← 로그인으로 돌아가기</button>
            <h1>회원가입</h1>

            <label htmlFor="regAccount">
              <span>아이디</span>
              <input
                id="regAccount"
                type="text"
                value={form.regAccount}
                onChange={onAccountInput}
                onBlur={() => checkAccount()}
                placeholder="아이디를 입력하세요 (4-20자)"
              />
              <div className={`validation-msg ${accountVal.status}`}>{accountVal.message}</div>
            </label>

            <label htmlFor="regPw">
              <span>비밀번호</span>
              <input
                id="regPw"
                type="password"
                value={form.regPw}
                onChange={(e) => setForm((f) => ({ ...f, regPw: e.target.value }))}
                placeholder="비밀번호를 입력하세요"
              />
            </label>

            <label htmlFor="regEmail">
              <span>이메일</span>
              <input
                id="regEmail"
                type="email"
                value={form.regEmail}
                onChange={onEmailInput}
                onBlur={() => checkEmail()}
                placeholder="이메일을 입력하세요"
              />
              <div className={`validation-msg ${emailVal.status}`}>{emailVal.message}</div>
            </label>

            <label htmlFor="regUserName">
              <span>닉네임</span>
              <input
                id="regUserName"
                type="text"
                value={form.regUserName}
                onChange={onUsernameInput}
                onBlur={() => checkUsername()}
                placeholder="닉네임을 입력하세요 (2-10자)"
              />
              <div className={`validation-msg ${usernameVal.status}`}>{usernameVal.message}</div>
            </label>

            <button
              className="btn-login"
              onClick={registerUser}
              disabled={!isFormValid || registerLoading}
            >
              {registerLoading ? '처리 중...' : '회원가입'}
            </button>
            <div className="toggle-link-container">
              <div className="toggle-link empty" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
