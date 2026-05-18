import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// 목 데이터: 허용된 계정 목록
const MOCK_USERS = [
  { id: 1, account: 'admin', password: '1234', name: '관리자' },
  { id: 2, account: 'user1', password: '1234', name: '홍길동' },
  { id: 3, account: 'test', password: 'test', name: '테스터' },
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // 자격증명만 검증, 상태는 변경하지 않음
  const validate = (account, password) => {
    const found = MOCK_USERS.find(
      (u) => u.account === account && u.password === password
    );
    if (found) {
      const { password: _, ...user } = found;
      return { success: true, user };
    }
    return { success: false };
  };

  // 애니메이션 완료 후 실제 로그인 상태 확정
  const confirmLogin = (user) => setCurrentUser(user);

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, validate, confirmLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
