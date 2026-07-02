import axios from 'axios';

// LOGIC: In dev (Vite proxy), use /api. In prod (Vercel), /api goes through proxy function.
const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flavrToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('flavrToken');
      localStorage.removeItem('flavrUser');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    const msg = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject({ ...err, message: msg });
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const dishAPI = {
  getAll: (params) => api.get('/dishes', { params }),
  getOne: (id) => api.get(`/dishes/${id}`),
  create: (data) => api.post('/dishes', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/dishes/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/dishes/${id}`),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (dishId, quantity) => api.post('/cart', { dishId, quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMy: () => api.get('/orders/myorders'),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const aiAPI = {
  recommend: (prompt) => api.post('/ai/recommend', { prompt }),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getOrders: () => api.get('/admin/orders'),
};
