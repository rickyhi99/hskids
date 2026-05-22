import { request } from './http';

export const getNeighbors = (userId) =>
  request('GET', '/api/neighbors', { userId });

export const getReceivedRequests = (userId) =>
  request('GET', '/api/neighbors/requests', { userId });

export const getStatusWith = (userId, targetUserId) =>
  request('GET', `/api/neighbors/status/${targetUserId}`, { userId });

export const sendRequest = (userId, toUserId) =>
  request('POST', '/api/neighbors', { body: { toUserId }, userId });

export const updateStatus = (userId, neighborId, status) =>
  request('PUT', `/api/neighbors/${neighborId}`, { body: { status }, userId });

export const deleteNeighbor = (userId, neighborId) =>
  request('DELETE', `/api/neighbors/${neighborId}`, { userId });
