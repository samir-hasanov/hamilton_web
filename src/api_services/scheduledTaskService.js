import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8085';

const scheduledTaskService = {
  // Çoxlu şirkətlərə vaxtlı tapşırıq təyin etmə
  assignBulkTasks: async (request) => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/scheduled-tasks/bulk-assign`, request);
    return response.data;
  },

  // Bütün scheduled task-ləri al
  getAllScheduledTasks: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/scheduled-tasks`);
    return response.data;
  },

  // İstifadəçiyə təyin edilmiş scheduled task-lər
  getScheduledTasksByUser: async (username) => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/scheduled-tasks/user/${username}`);
    return response.data;
  },

  // Gələcək scheduled task-lər
  getUpcomingScheduledTasks: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/scheduled-tasks/upcoming`);
    return response.data;
  },

  // Bugünkü scheduled task-lər
  getTodayScheduledTasks: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/scheduled-tasks/today`);
    return response.data;
  },

  // Scheduled task-i ləğv et
  cancelScheduledTask: async (taskId) => {
    const response = await axios.delete(`${API_BASE_URL}/api/v1/scheduled-tasks/${taskId}`);
    return response.data;
  }
};

export default scheduledTaskService;
