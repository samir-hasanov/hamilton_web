import axios from 'axios';
import { isTokenExpired, clearExpiredTokens, setupTokenCleanup } from '../utils/tokenUtils';

const API_BASE_URL = 'http://localhost:8085/api/v1';

const authService = {
  login: async (username, password) => {
    try {
      // Clear any existing tokens before login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      
      // Token-ləri localStorage-də saxla
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Local storage-dən token-ləri sil
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      // Clear expired tokens
      clearExpiredTokens();
      return false;
    }
    
    return true;
  },

  getUsersByRole: async (roleName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/users/role/${roleName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bütün istifadəçiləri al
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/users`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bütün rolları al
  getAllRoles: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/roles`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // İstifadəçiyə rol əlavə et
  addRoleToUser: async (username, roleName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/users/${username}/roles?roleName=${roleName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // İstifadəçidən rol sil
  removeRoleFromUser: async (username, roleName) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/auth/users/${username}/roles?roleName=${roleName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // İstifadəçini sil
  deleteUser: async (username) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/auth/users/${username}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // İstifadəçinin şifrəsini reset et
  resetUserPassword: async (username, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/users/${username}/reset-password?newPassword=${encodeURIComponent(newPassword)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Axios interceptor - request-lərə token əlavə et
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Check if token is expired before sending request
      if (isTokenExpired(token)) {
        // Clear expired tokens
        clearExpiredTokens();
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Token expired'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios interceptor - response-ları handle et
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) and 403 (Forbidden) errors
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await authService.refreshToken();
        const token = localStorage.getItem('accessToken');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout and redirect to login
        authService.logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Setup token cleanup on module load
setupTokenCleanup();

export default authService;
