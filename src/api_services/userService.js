import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const userService = {
  // Bütün istifadəçiləri al
  getAllUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/users`);
    return response.data;
  },

  // Rola görə istifadəçiləri al
  getUsersByRole: async (roleName) => {
    const response = await axios.get(`${API_BASE_URL}/auth/users/role/${roleName}`);
    return response.data;
  },

  // İstifadəçi məlumatlarını al
  getUserInfo: async (username) => {
    const response = await axios.get(`${API_BASE_URL}/auth/users/${username}`);
    return response.data;
  },

  // İstifadəçi yenilə
  updateUser: async (username, userData) => {
    const response = await axios.put(`${API_BASE_URL}/auth/users/${username}`, userData);
    return response.data;
  },

  // İstifadəçi sil
  deleteUser: async (username) => {
    const response = await axios.delete(`${API_BASE_URL}/auth/users/${username}`);
    return response.data;
  }
};

export default userService;
