import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api` || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateSettings: (data) => api.put('/auth/settings', data),
};

// Referral
export const referralAPI = {
  getInfo: () => api.get('/referral/info'),
  validateCode: (code) => api.get(`/referral/validate/${code}`),
};

// Wallet
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  submitManualDeposit: (data) => api.post('/wallet/deposit', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
};

// Admin
export const adminAPI = {
  getPending: (type) => api.get('/admin/transactions/pending', { params: { type } }),
  approve: (id) => api.post(`/admin/transactions/approve/${id}`),
  reject: (id) => api.post(`/admin/transactions/reject/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getUsers: () => api.get('/admin/users'),
};

// Games
export const gamesAPI = {
  getAll: (category) => api.get('/games', { params: { category } }),
  getGame: (id) => api.get(`/games/${id}`),
  play: (data) => api.post('/games/play', data),
  getHistory: (params) => api.get('/games/history/me', { params }),
};

// Spinner
export const spinnerAPI = {
  spin: () => api.post('/spinner/spin'),
  getStatus: () => api.get('/spinner/status'),
  getHistory: () => api.get('/spinner/history'),
};

// Activity Feed
export const activityAPI = {
  getFeed: () => api.get('/activity/feed'),
};

export default api;
