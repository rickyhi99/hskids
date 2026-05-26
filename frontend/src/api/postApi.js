import { request } from './http';

export const getAllPosts = () =>
  request('GET', '/api/posts');

export const getMyPosts = (numericId) =>
  request('GET', '/api/posts/me', { userId: numericId });

export const getUserPosts = (userId) =>
  request('GET', `/api/posts/users/${userId}`);

export const getOnePost = (postId) =>
  request('GET', `/api/posts/${postId}`);

export const createPost = (numericId, body) =>
  request('POST', '/api/posts', { body, userId: numericId });

export const updatePost = (numericId, postId, body) =>
  request('PUT', `/api/posts/${postId}`, { body, userId: numericId });

export const deletePost = (numericId, postId) =>
  request('DELETE', `/api/posts/${postId}`, { userId: numericId });

export const getLikedPostIds = (numericId) =>
  request('GET', '/api/posts/liked', { userId: numericId });

export const likePost = (numericId, postId) =>
  request('POST', `/api/posts/${postId}/like`, { userId: numericId });

export const unlikePost = (numericId, postId) =>
  request('DELETE', `/api/posts/${postId}/like`, { userId: numericId });
