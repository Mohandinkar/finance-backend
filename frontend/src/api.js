import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized API calls matching your Express backend exactly
export const LedgerAPI = {
  // --- AUTHENTICATION ---
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // --- DASHBOARD ---
  getDashboardSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  // --- RECORDS (LEDGER) ---
  getRecords: async (params) => {
    // params will handle our pagination and filtering: ?page=1&limit=10&type=Expense
    const response = await api.get('/records', { params });
    return response.data;
  },
  addRecord: async (recordData) => {
    const response = await api.post('/records', recordData);
    return response.data;
  },

  // --- USER MANAGEMENT (ADMIN ONLY) ---
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  updateUserRole: async (userId, updateData) => {
    // updateData will be an object like { role: "Analyst" } or { status: "Inactive" }
    const response = await api.put(`/users/${userId}`, updateData);
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};

export default api;