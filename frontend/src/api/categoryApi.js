import { request } from './http';

export const getCategories = (userId) =>
  request('GET', `/api/users/${userId}/categories`);

export const createCategory = (body) => {
  const token = localStorage.getItem('accessToken');
  return request('POST', '/api/categories', { body, token });
};

export const updateCategory = (id, body) => {
  const token = localStorage.getItem('accessToken');
  return request('PUT', `/api/categories/${id}`, { body, token });
};

export const deleteCategory = (id) => {
  const token = localStorage.getItem('accessToken');
  return request('DELETE', `/api/categories/${id}`, { token });
};
