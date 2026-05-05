import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const scheduledTaskService = {
  assignBulkTasks: async (request) => {
    const response = await axios.post(`${API_BASE_URL}/scheduled-tasks/bulk-assign`, request);
    return response.data;
  },

  getAllScheduledTasks: async () => {
    const response = await axios.get(`${API_BASE_URL}/scheduled-tasks`);
    return response.data;
  },

  getScheduledTasksByUser: async (username) => {
    const response = await axios.get(`${API_BASE_URL}/scheduled-tasks/user/${username}`);
    return response.data;
  },

  getUpcomingScheduledTasks: async () => {
    const response = await axios.get(`${API_BASE_URL}/scheduled-tasks/upcoming`);
    return response.data;
  },

  getTodayScheduledTasks: async () => {
    const response = await axios.get(`${API_BASE_URL}/scheduled-tasks/today`);
    return response.data;
  },

  cancelScheduledTask: async (taskId) => {
    const response = await axios.delete(`${API_BASE_URL}/scheduled-tasks/${taskId}`);
    return response.data;
  }
};

export default scheduledTaskService;
