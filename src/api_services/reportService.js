import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const reportService = {
  getUserPerformance: async () => {
    const res = await axios.get(`${API_BASE_URL}/reports/user-performance`);
    return res.data;
  }
};

export default reportService;


