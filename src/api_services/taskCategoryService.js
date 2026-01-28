import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8085';

const taskCategoryService = {
  // Bütün kateqoriyaları al
  getAllCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/task-categories`);
    return response.data;
  },

  // Kateqoriya yarat
  createCategory: async (category) => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/task-categories`, category);
    return response.data;
  },

  // Kateqoriya yenilə
  updateCategory: async (id, category) => {
    const response = await axios.put(`${API_BASE_URL}/api/v1/task-categories/${id}`, category);
    return response.data;
  },

  // Kateqoriya sil
  deleteCategory: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/v1/task-categories/${id}`);
    return response.data;
  }
};

export default taskCategoryService;
