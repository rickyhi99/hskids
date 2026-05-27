const BASE_URL = 'http://localhost:8081';

export const request = async (method, path, { body, token, userId, params } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId != null) headers['X-User-Id'] = String(userId);

  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || '서버 오류가 발생했습니다.');
  return json;
};

export const uploadFile = async (path, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || '파일 업로드에 실패했습니다.');
  return json;
};
