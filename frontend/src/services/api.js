import axios from 'axios';

// LOGIC: In dev, /api is proxied by Vite to backend.
// In prod (Vercel), /api goes through the proxy function that injects OIDC token.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
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
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
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
  create: (data) => api.post('/dishes', data, getUploadConfig()),
  update: (id, data) => api.put(`/dishes/${id}`, data, getUploadConfig()),
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

const getUploadConfig = () => ({
  headers: { 'Content-Type': 'multipart/form-data' },
});
