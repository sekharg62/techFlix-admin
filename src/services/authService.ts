import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginCredentials {
  email?: string;
  password?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'manager';
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  data?: AuthUser;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/users/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      localStorage.removeItem('techflix_admin_user');
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const savedUser = localStorage.getItem('techflix_admin_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};

export default authService;
