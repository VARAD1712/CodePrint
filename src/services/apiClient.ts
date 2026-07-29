import axios from 'axios';
import type { UserRole } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codeprint_jwt_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface JwtTokenResponse {
  token: string;
  expiresIn: string;
  role: UserRole;
  user: Record<string, unknown>;
}

export const authService = {
  negotiateToken: async (
    uid: string,
    email: string | null,
    role: UserRole,
    fullName: string,
    companyName?: string
  ): Promise<string | null> => {
    try {
      const res = await apiClient.post<JwtTokenResponse>('/api/auth/token', {
        uid,
        email,
        role,
        fullName,
        companyName: companyName || fullName,
      });
      if (res.data && res.data.token) {
        localStorage.setItem('codeprint_jwt_token', res.data.token);
        localStorage.setItem('codeprint_jwt_role', res.data.role);
        return res.data.token;
      }
      return null;
    } catch (err) {
      console.warn('Centralized JWT Token negotiation failed (working in fallback/local mode):', err);
      return null;
    }
  },

  getToken: (): string | null => localStorage.getItem('codeprint_jwt_token'),

  clearToken: (): void => {
    localStorage.removeItem('codeprint_jwt_token');
    localStorage.removeItem('codeprint_jwt_role');
  },
};
