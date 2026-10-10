import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: '', // Uses Vite proxy to http://localhost:5000
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pspl_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle session expiration / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('pspl_token');
      localStorage.removeItem('pspl_user');
      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/api/auth/login', credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  }
};

// Voucher Endpoints
export const voucherAPI = {
  getVouchers: async (params = {}) => {
    const res = await api.get('/api/vouchers', { params });
    return res.data;
  },
  getVoucherById: async (id) => {
    const res = await api.get(`/api/vouchers/${id}`);
    return res.data;
  },
  createVoucher: async (voucherData) => {
    const res = await api.post('/api/vouchers', voucherData);
    return res.data;
  },
  updateVoucher: async (id, voucherData) => {
    const res = await api.put(`/api/vouchers/${id}`, voucherData);
    return res.data;
  },
  deleteVoucher: async (id) => {
    const res = await api.delete(`/api/vouchers/${id}`);
    return res.data;
  },
  submitVoucher: async (id, voucherData = {}) => {
    const res = await api.post(`/api/vouchers/${id}/submit`, voucherData);
    return res.data;
  },
  approveVoucher: async (id, payload) => {
    const res = await api.post(`/api/vouchers/${id}/approve`, payload);
    return res.data;
  },
  rejectVoucher: async (id, payload) => {
    const res = await api.post(`/api/vouchers/${id}/reject`, payload);
    return res.data;
  }
};

// Dashboard Endpoints
export const dashboardAPI = {
  getEmployeeDashboard: async () => {
    const res = await api.get('/api/dashboard/employee');
    return res.data;
  },
  getDirectorDashboard: async () => {
    const res = await api.get('/api/dashboard/director');
    return res.data;
  },
  getAccountsDashboard: async () => {
    const res = await api.get('/api/dashboard/accounts');
    return res.data;
  }
};

// Signature Upload Endpoint
export const uploadAPI = {
  uploadSignature: async (file) => {
    const formData = new FormData();
    formData.append('signature', file);
    const res = await api.post('/api/upload/signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};

export default api;
