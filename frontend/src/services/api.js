import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('returnshield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle unauthorized 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('returnshield_token');
      localStorage.removeItem('returnshield_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, store_name, password) => api.post('/auth/register', { name, email, store_name, password }),
  getCurrentUser: () => api.get('/auth/me')
};

export const dashboardService = {
  getSummary: () => api.get('/analytics/dashboard'),
  getDeepAnalytics: () => api.get('/analytics/deep')
};

export const productService = {
  list: () => api.get('/products'),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/products/${id}`)
};

export const orderService = {
  list: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
  get: (id) => api.get(`/orders/${id}`)
};

export const dispatchService = {
  list: () => api.get('/dispatch'),
  create: (formData) => api.post('/dispatch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const returnService = {
  list: () => api.get('/returns'),
  create: (formData) => api.post('/returns', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const inspectionService = {
  getWorkspace: (returnId) => api.get(`/inspection/${returnId}`),
  recordInspection: (returnId, data) => api.post(`/inspection/${returnId}`, data)
};

export const riskService = {
  list: () => api.get('/risk')
};

export const claimService = {
  list: () => api.get('/claims'),
  create: (data) => api.post('/claims', data)
};

export default api;
