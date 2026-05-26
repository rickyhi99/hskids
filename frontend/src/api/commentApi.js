import { request } from './http';

export const getComments = (postId) =>
  request('GET', `/api/posts/${postId}/comments`);

export const createComment = (userId, postId, content) =>
  request('POST', `/api/posts/${postId}/comments`, { body: { content }, userId });

export const updateComment = (userId, commentId, content) =>
  request('PUT', `/api/comments/${commentId}`, { body: { content }, userId });

export const deleteComment = (userId, commentId) =>
  request('DELETE', `/api/comments/${commentId}`, { userId });
