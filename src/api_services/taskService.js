import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/v1';

// Request interceptor - token-lər authService-də əlavə olunur
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const taskService = {
  // Bütün tapşırıqları al
  getAllTasks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Səhifələnmiş tapşırıqları al
  getTasksPage: async ({ page = 0, size = 10, sort = 'createdAt,desc' } = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/page`, {
        params: { page, size, sort }
      });
      return response.data; // Spring Page<TaskResponse>
    } catch (error) {
      throw error;
    }
  },

  // Gecikmiş tapşırıqları al
  getOverdueTasks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/overdue`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mənim tapşırıqlarımı al
  getMyTasks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/my-tasks`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mənim tapşırıqlarım - səhifələnmiş
  getMyTasksPage: async ({ page = 0, size = 10, sort = 'createdAt,desc' } = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/my-tasks/page`, {
        params: { page, size, sort }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tapşırıq yarat
  createTask: async (taskData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tapşırıq statusunu yenilə
  updateTaskStatus: async (taskId, statusData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tapşırığı istifadəçiyə təyin et
  assignTaskToUser: async (taskId, username) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}/assign/${username}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tapşırığı sil
  deleteTask: async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
    } catch (error) {
      throw error;
    }
  },

  // Tapşırıq detallarını al
  getTaskById: async (taskId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tapşırığı başlat (işçi üçün)
  startTask: async (taskId, comment) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/start`, { comment });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tapşırığı tamamla (işçi üçün)
  completeTask: async (taskId, comment, file) => {
    try {
      const formData = new FormData();
      if (comment) {
        formData.append('comment', comment);
      }
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fayl yüklə
  downloadFile: async (fileName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/files/${fileName}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default taskService;
