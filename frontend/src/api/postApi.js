import { request } from './http';

// 페이지네이션 응답: { content, page, size, totalElements, totalPages }
export const getAllPosts = (search, page = 0, size = 10) =>
  request('GET', '/api/posts', { params: { search: search || undefined, page, size } });

export const getMyPosts = (numericId) =>
  request('GET', '/api/posts/me', { userId: numericId });

// 특정 유저 포스트 (검색 + 카테고리 + 페이지네이션)
export const getUserPosts = (userId, search, categoryId, page = 0, size = 10) =>
  request('GET', `/api/users/${userId}/posts`, {
    params: {
      search: search || undefined,
      category: categoryId || undefined,
      page,
      size,
    },
  });

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
