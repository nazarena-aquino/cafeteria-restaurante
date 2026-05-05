import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================
// API FUNCTIONS
// ========================

export const productApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/products/admin/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories/public'),
  // Admin
  getAllAdmin: () => api.get('/products/admin/all'),
  getCategoriesAdmin: () => api.get('/products/admin/categories'),
  create: (data: Record<string, unknown>) => api.post('/products/admin', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/products/admin/${id}`, data),
  delete: (id: string) => api.delete(`/products/admin/${id}`),
  toggle: (id: string) => api.patch(`/products/admin/${id}/toggle`),
  createCategory: (data: Record<string, unknown>) => api.post('/products/admin/categories', data),
  updateCategory: (id: string, data: Record<string, unknown>) => api.put(`/products/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/products/admin/categories/${id}`),
};

export const orderApi = {
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  track: (orderNumber: string) => api.get(`/orders/track/${orderNumber}`),
  // Admin
  getAll: (params?: Record<string, unknown>) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  updatePayment: (id: string, data: Record<string, unknown>) => api.patch(`/orders/${id}/payment`, data),
  getStats: () => api.get('/orders/dashboard/stats'),
};

export const paymentApi = {
  createPreference: (orderId: string) => api.post('/payments/create-preference', { order_id: orderId }),
  confirmCash: (orderId: string) => api.patch(`/payments/cash/${orderId}/confirm`),
  getStatus: (paymentId: string) => api.get(`/payments/status/${paymentId}`),
};

export const configApi = {
  get: () => api.get('/config'),
  getMPKey: () => api.get('/config/mp-public-key'),
  update: (data: Record<string, unknown>) => api.put('/config', data),
  toggleOpen: () => api.patch('/config/toggle-open'),
};

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  verify: () => api.get('/auth/verify'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

export const qrApi = {
  getMenuQR: () => api.get('/qr/menu'),
  getTableQR: (tableNumber: string) => api.get(`/qr/table/${tableNumber}`),
};
