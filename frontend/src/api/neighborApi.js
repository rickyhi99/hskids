import { request } from './http';

const token = () => localStorage.getItem('accessToken');

// GET /api/neighbors/status/{targetUserId} — X-User-Id 방식 유지
export const getStatusWith = (userId, targetUserId) =>
  request('GET', `/api/neighbors/status/${targetUserId}`, { userId });

// 이하 모두 JWT(Authentication) 방식
export const getNeighbors = () =>
  request('GET', '/api/neighbors', { token: token() });

export const getReceivedRequests = () =>
  request('GET', '/api/neighbors/requests', { token: token() });

export const sendRequest = (toUserId) =>
  request('POST', '/api/neighbors', { body: { toUserId }, token: token() });

export const updateStatus = (neighborId, status) =>
  request('PUT', `/api/neighbors/${neighborId}`, { body: { status }, token: token() });

export const deleteNeighbor = (neighborId) =>
  request('DELETE', `/api/neighbors/${neighborId}`, { token: token() });
