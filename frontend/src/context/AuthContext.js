import { createContext, useContext, useState, useEffect } from 'react';
import * as userApi from '../api/userApi';

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) { setAuthReady(true); return; }
      const payload = parseJwt(token);
      if (!payload || payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAuthReady(true);
        return;
      }
      try {
        const res = await userApi.getMe(token);
        setCurrentUser({ ...res.data, role: payload.role });
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setAuthReady(true);
      }
    };
    restore();
  }, []);

  // 자격증명 검증 → 토큰 저장 → 유저 정보 반환
  const validate = async (id, password) => {
    const loginRes = await userApi.login(id, password);
    const { accessToken, refreshToken } = loginRes.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const payload = parseJwt(accessToken);
    const meRes = await userApi.getMe(accessToken);
    return { ...meRes.data, role: payload.role };
  };

  // 애니메이션 완료 후 실제 로그인 상태 확정
  const confirmLogin = (user) => setCurrentUser(user);

  const logout = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      if (token) await userApi.logout(token);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setCurrentUser(null);
    }
  };

  const refreshSession = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('refresh token 없음');
    const res = await userApi.refreshTokens(refreshToken);
    const { accessToken, refreshToken: newRefresh } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefresh);
    const payload = parseJwt(accessToken);
    const meRes = await userApi.getMe(accessToken);
    const user = { ...meRes.data, role: payload.role };
    setCurrentUser(user);
    return accessToken;
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const res = await userApi.getMe(token);
    const payload = parseJwt(token);
    setCurrentUser({ ...res.data, role: payload?.role });
  };

  return (
    <AuthContext.Provider value={{ currentUser, authReady, validate, confirmLogin, logout, refreshSession, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
