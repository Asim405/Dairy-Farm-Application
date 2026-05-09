import apiClient from './apiClient';

// Auth Services
export const authService = {
  register: (username, email, password, firstName, lastName) =>
    apiClient.post('/auth/register', {
      username,
      email,
      password,
      firstName,
      lastName,
    }),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
};

// User Services
export const userService = {
  getProfile: () => apiClient.get('/users/profile'),

  updateProfile: (firstName, lastName, phone, bio) =>
    apiClient.put('/users/profile', { firstName, lastName, phone, bio }),

  getUserById: (userId) => apiClient.get(`/users/${userId}`),
};

// Item Services
export const itemService = {
  getAllItems: () => apiClient.get('/items'),

  getItemById: (itemId) => apiClient.get(`/items/${itemId}`),

  createItem: (title, description, category, price, quantity, imageUrl) =>
    apiClient.post('/items', {
      title,
      description,
      category,
      price,
      quantity,
      imageUrl,
    }),

  updateItem: (itemId, title, description, category, price, quantity) =>
    apiClient.put(`/items/${itemId}`, {
      title,
      description,
      category,
      price,
      quantity,
    }),

  deleteItem: (itemId) => apiClient.delete(`/items/${itemId}`),

  searchItems: (query) => apiClient.get(`/items/search/${query}`),
};
