import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RabbitAnimation from '../components/login/RabbitAnimation';
import { useAuth } from '../context/AuthContext';
import './Login.css';

// 목 데이터: 이미 사용 중인 아이디/닉네임
const TAKEN_ACCOUNTS = ['admin', 'user1', 'test', 'ricky', 'hello'];
const TAKEN_USERNAMES = ['관리자', '홍길동', '테스터'];

// 목 회원 DB (회원가입 시 여기에 추가)
const mockMemberDB = [
  { id: 1, account: 'admin', password: '1234', userName: '관리자', height: 175, weight: 70, gender: 'MALE', age: 30 },
  { id: 2, account: 'user1', password: '1234', userName: '홍길동', height: 170, weight: 65, gender: 'MALE', age: 25 },
  { id: 3, account: 'test', password: 'test', userName: '테스터', height: 165, weight: 55, gender: 'FEMALE', age: 22 },
];
let nextId = 4;

export default function Login() {
  const navigate = useNavigate();
  const { validate, confirmLogin } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [pwFocused, setPwFocused] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const pendingUser = useRef(null);

  // 회원가입 폼
  const [form, setForm] = useState({
    regAccount: '', regPw: '', regUserName: '',
    regHeight: '', regWeight: '', regGender: 'MALE', regAge: '',
  });
  const [accountVal, setAccountVal] = useState({ status: '', message: '' });
  const [usernameVal, setUsernameVal] = useState({ status: '', message: '' });

  const accountTimerRef = useRef(null);
  const usernameTimerRef = useRef(null);

  const isFormValid =
    form.regAccount && form.regPw && form.regUserName &&
    form.regHeight && form.regWeight && form.regAge &&
    accountVal.status === 'success' && usernameVal.status === 'success';

  // ── 로그인 ──────────────────────────────────────────────────
  const submitLogin = () => {
    const result = validate(loginId, loginPw);
    if (result.success) {
      pendingUser.current = result.user; // 검증만, 상태는 아직 변경 안 함
      setLoginSuccess(true);            // 애니메이션 시작
    } else {
      alert('계정 정보가 올바르지 않습니다.');
    }
  };

  const onAnimationEnd = () => {
    if (pendingUser.current) {
      confirmLogin(pendingUser.current); // 애니메이션 완료 후 실제 로그인 확정
      navigate('/home');
    }
  };

  // ── 아이디 중복 검사 (목 데이터) ────────────────────────────
  const checkAccount = (value) => {
    const v = value ?? form.regAccount;
    if (!v) return;
    setAccountVal({ status: 'checking', message: '확인 중...' });
    setTimeout(() => {
      if (v.length < 4 || v.length > 20) {
        setAccountVal({ status: 'error', message: '아이디는 4-20자 사이로 입력해주세요.' });
      } else if (TAKEN_ACCOUNTS.includes(v)) {
        setAccountVal({ status: 'error', message: '이미 사용중인 아이디입니다.' });
      } else {
        setAccountVal({ status: 'success', message: '사용 가능한 아이디입니다.' });
      }
    }, 300);
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

  // ── 닉네임 중복 검사 (목 데이터) ────────────────────────────
  const checkUsername = (value) => {
    const v = value ?? form.regUserName;
    if (!v) return;
    setUsernameVal({ status: 'checking', message: '확인 중...' });
    setTimeout(() => {
      if (v.length < 2 || v.length > 10) {
        setUsernameVal({ status: 'error', message: '닉네임은 2-10자 사이로 입력해주세요.' });
      } else if (TAKEN_USERNAMES.includes(v)) {
        setUsernameVal({ status: 'error', message: '이미 사용중인 닉네임입니다.' });
      } else {
        setUsernameVal({ status: 'success', message: '사용 가능한 닉네임입니다.' });
      }
    }, 300);
  };

  const onUsernameInput = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, regUserName: val }));
    setUsernameVal({ status: '', message: '' });
    clearTimeout(usernameTimerRef.current);
    if (val.length >= 2) {
      usernameTimerRef.current = setTimeout(() => checkUsername(val), 500);
    }
  };

  // ── 회원가입 ─────────────────────────────────────────────────
  const registerUser = () => {
    if (!isFormValid) {
      alert('모든 필드를 올바르게 입력해주세요.');
      return;
    }
    mockMemberDB.push({
      id: nextId++,
      account: form.regAccount,
      password: form.regPw,
      userName: form.regUserName,
      height: form.regHeight,
      weight: form.regWeight,
      gender: form.regGender,
      age: form.regAge,
    });
    TAKEN_ACCOUNTS.push(form.regAccount);
    TAKEN_USERNAMES.push(form.regUserName);
    alert('회원가입에 성공했습니다.');
    setForm({ regAccount: '', regPw: '', regUserName: '', regHeight: '', regWeight: '', regGender: 'MALE', regAge: '' });
    setAccountVal({ status: '', message: '' });
    setUsernameVal({ status: '', message: '' });
    setIsRegistering(false);
  };

  const toggleForm = () => {
    setTimeout(() => {
      setIsRegistering((v) => !v);
      setAccountVal({ status: '', message: '' });
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
                placeholder="비밀번호를 입력하세요"
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
              />
            </label>
            <button className="btn-login" onClick={submitLogin}>Login</button>
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
                placeholder="아이디를 입력하세요"
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

            <label htmlFor="regUserName">
              <span>닉네임</span>
              <input
                id="regUserName"
                type="text"
                value={form.regUserName}
                onChange={onUsernameInput}
                onBlur={() => checkUsername()}
                placeholder="닉네임을 입력하세요"
              />
              <div className={`validation-msg ${usernameVal.status}`}>{usernameVal.message}</div>
            </label>

            <label htmlFor="regHeight">
              <span>키 (cm)</span>
              <input
                id="regHeight"
                type="number"
                value={form.regHeight}
                onChange={(e) => setForm((f) => ({ ...f, regHeight: e.target.value }))}
                placeholder="키를 입력하세요"
              />
            </label>

            <label htmlFor="regWeight">
              <span>몸무게 (kg)</span>
              <input
                id="regWeight"
                type="number"
                value={form.regWeight}
                onChange={(e) => setForm((f) => ({ ...f, regWeight: e.target.value }))}
                placeholder="몸무게를 입력하세요"
              />
            </label>

            <label htmlFor="regGender">
              <span>성별</span>
              <select
                id="regGender"
                value={form.regGender}
                onChange={(e) => setForm((f) => ({ ...f, regGender: e.target.value }))}
              >
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
            </label>

            <label htmlFor="regAge">
              <span>나이</span>
              <input
                id="regAge"
                type="number"
                value={form.regAge}
                onChange={(e) => setForm((f) => ({ ...f, regAge: e.target.value }))}
                placeholder="나이를 입력하세요"
              />
            </label>

            <button className="btn-login" onClick={registerUser} disabled={!isFormValid}>
              회원가입
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
