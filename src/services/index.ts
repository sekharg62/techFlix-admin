import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor (Attach token if present)
apiClient.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('techflix_admin_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user token from localStorage:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Handle common errors globally)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('techflix_admin_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
