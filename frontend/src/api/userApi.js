import { request } from './http';

const ERROR_MESSAGES = {
  AUTH_MISMATCH: '아이디 또는 비밀번호가 일치하지 않습니다.',
  AUTH_TOKEN_EXPIRED: '인증이 만료되었습니다. 다시 로그인해 주세요.',
  AUTH_INVALID_TOKEN: '유효하지 않은 토큰입니다.',
  USER_DUPLICATED_ID: '이미 사용 중인 아이디입니다.',
  USER_DUPLICATED_EMAIL: '이미 사용 중인 이메일입니다.',
  USER_DUPLICATED_NICKNAME: '이미 사용 중인 닉네임입니다.',
  USER_NOT_FOUND: '유저를 찾을 수 없습니다.',
};

const req = async (method, path, options = {}) => {
  try {
    return await request(method, path, options);
  } catch (e) {
    const code = e.code;
    throw new Error(ERROR_MESSAGES[code] || e.message);
  }
};

export const login = (id, password) =>
  request('POST', '/api/auth/login', { body: { id, password } });

export const logout = (token) =>
  request('POST', '/api/auth/logout', { token });

export const refreshTokens = (refreshToken) =>
  request('POST', '/api/auth/refresh', { token: refreshToken });

export const getMe = (token) =>
  request('GET', '/api/users/me', { token });

export const join = (id, password, email, nickname) =>
  request('POST', '/api/users/join', { body: { id, password, email, nickname } });

export const checkId = (id) =>
  request('GET', `/api/users/check?id=${encodeURIComponent(id)}`);

export const checkEmail = (email) =>
  request('GET', `/api/users/check?email=${encodeURIComponent(email)}`);

export const checkNickname = (nickname) =>
  request('GET', `/api/users/check?nickname=${encodeURIComponent(nickname)}`);

export const updateInfo = (body) =>
  request('PUT', '/api/users/me', { body, token: localStorage.getItem('accessToken') });

export const withdraw = () =>
  request('DELETE', '/api/users/me', { token: localStorage.getItem('accessToken') });
