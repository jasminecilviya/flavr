import axios from 'axios';

// LOGIC: In dev, Vite proxies /api to localhost:5000.
// In prod, calls backend directly via VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flavrToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Something went wrong';
    if (err.response?.status === 401) {
      localStorage.removeItem('flavrToken');
      localStorage.removeItem('flavrUser');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(new Error(msg));
  }
);

export default api;

// ─── Auth ─────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ─── Dishes ───────────────────────────────────
// FIX: Remove forced multipart — send as JSON by default.
// Use uploadDishImage for file uploads when Cloudinary is wired.
export const dishAPI = {
  getAll: (params) => api.get('/dishes', { params }),
  getOne: (id) => api.get(`/dishes/${id}`),
  create: (data) => api.post('/dishes', data),
  update: (id, data) => api.put(`/dishes/${id}`, data),
  delete: (id) => api.delete(`/dishes/${id}`),
};

// ─── Cart ─────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (dishId, quantity) => api.post('/cart', { dishId, quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
};

// ─── Orders ───────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMy: () => api.get('/orders/myorders'),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// ─── AI ───────────────────────────────────────
export const aiAPI = {
  recommend: (prompt, history, language) => {
    const params = { prompt, history };
    if (language) params.language = language;
    return api.post('/ai/recommend', params);
  },
  chat: (message, history) => api.post('/ai/chat', { message, history }),
  mealPlan: (preferences, days) => api.post('/ai/meal-plan', { preferences, days }),
};

// ─── Admin ────────────────────────────────────
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getOrders: () => api.get('/admin/orders'),
  getStats: () => api.get('/admin/stats'),
  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  toggleCoupon: (id) => api.put(`/admin/coupons/${id}/toggle`),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
};

// ─── Restaurants ──────────────────────────────
export const restaurantAPI = {
  getAll: () => api.get('/restaurants'),
  create: (data) => api.post('/restaurants', data),
};

// ─── Favorites ────────────────────────────────
export const favoriteAPI = {
  getAll: () => api.get('/favorites'),
  getIds: () => api.get('/favorites/ids'),
  toggle: (dishId) => api.post(`/favorites/${dishId}`),
};

// ─── Reviews ──────────────────────────────────
export const reviewAPI = {
  get: (dishId) => api.get(`/reviews/${dishId}`),
  create: (dishId, data) => api.post(`/reviews/${dishId}`, data),
};

// ─── Coupons (public) ─────────────────────────
export const couponAPI = {
  validate: (code, amount) => api.post('/coupons/validate', { code, amount }),
};

// ─── Constants ────────────────────────────────
export const CATEGORIES_LIST = ['Breakfast', 'Lunch', 'Dinner', 'Beverages'];
