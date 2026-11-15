import axios, { AxiosError } from 'axios';

/** Backend base URL. Every backend route lives under /api, so it is appended when the env value leaves it out. */
const RAW_API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
export const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

/** Shared axios instance: attaches the admin JWT and logs out on 401. */
export const apiClient = axios.create({ baseURL: API_URL, timeout: 20000 });

apiClient.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('techflix_admin_user');
    const token = saved ? JSON.parse(saved)?.token : null;
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
  } catch {
    // ignore malformed storage
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('techflix_admin_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

/** Best human-readable message from an API error. */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'Cannot reach the server. Check your connection.';
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
