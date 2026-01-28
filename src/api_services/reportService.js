import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/v1';

const reportService = {
  getUserPerformance: async () => {
    const res = await axios.get(`${API_BASE_URL}/reports/user-performance`);
    return res.data;
  }
};

export default reportService;


