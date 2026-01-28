import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8085';

const userService = {
  // Bütün istifadəçiləri al
  getAllUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/auth/users`);
    return response.data;
  },

  // Rola görə istifadəçiləri al
  getUsersByRole: async (roleName) => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/auth/users/role/${roleName}`);
    return response.data;
  },

  // İstifadəçi məlumatlarını al
  getUserInfo: async (username) => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/auth/users/${username}`);
    return response.data;
  },

  // İstifadəçi yenilə
  updateUser: async (username, userData) => {
    const response = await axios.put(`${API_BASE_URL}/api/v1/auth/users/${username}`, userData);
    return response.data;
  },

  // İstifadəçi sil
  deleteUser: async (username) => {
    const response = await axios.delete(`${API_BASE_URL}/api/v1/auth/users/${username}`);
    return response.data;
  }
};

export default userService;
