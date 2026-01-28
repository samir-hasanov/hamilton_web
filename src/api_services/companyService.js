import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/v1';

const companyService = {
  // Bütün şirkətləri al
  getAllCompanies: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.voen && String(filters.voen).trim() !== '') {
        params.append('voen', String(filters.voen).trim());
      }
      const query = params.toString();
      const url = query ? `${API_BASE_URL}/companies?${query}` : `${API_BASE_URL}/companies`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Şirkət yarat
  createCompany: async (companyData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/companies`, companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Şirkəti yenilə
  updateCompany: async (companyId, companyData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/companies/${companyId}`, companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Şirkəti sil
  deleteCompany: async (companyId) => {
    try {
      await axios.delete(`${API_BASE_URL}/companies/${companyId}`);
    } catch (error) {
      throw error;
    }
  },

  // Şirkət detallarını al
  getCompanyById: async (companyId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mövcud istifadəçinin şirkətləri (təhkim + public)
  getMyCompanies: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies/my`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Excel-dən import
  importCompanies: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE_URL}/companies/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Son yoxlanış tarixini yenilə
  updateLastCheckDate: async (companyId, date) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/companies/${companyId}/last-check-date?date=${date}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Şirkəti işçiyə təhkim et
  assignCompany: async (companyId, username) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/companies/${companyId}/assign/${encodeURIComponent(username)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Şirkətin təhkimini geri al
  unassignCompany: async (companyId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/companies/${companyId}/unassign`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Şirkəti ümumi (public) et və ya ləğv et
  setCompanyPublic: async (companyId, value) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/companies/${companyId}/public?value=${value}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Şirkətin bütün məlumatlarını yenilə
  updateCompanyFull: async (companyId, companyData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/companies/${companyId}/full`, companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default companyService;
