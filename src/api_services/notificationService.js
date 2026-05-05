import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const notificationService = {
  getMyNotifications: async () => {
    const res = await axios.get(`${API_BASE_URL}/notifications`);
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await axios.get(`${API_BASE_URL}/notifications/unread-count`);
    return res.data;
  },
  markAllRead: async () => {
    await axios.post(`${API_BASE_URL}/notifications/mark-all-read`);
  }
};

export default notificationService;


