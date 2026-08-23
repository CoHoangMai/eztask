import { apiRequest, setAuthToken, removeAuthToken } from './apiClient';
import type { Assignee } from '../types/kanban';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: Assignee;
}

/**
 * Identity Service API (Spring Boot 3 + PostgreSQL via Spring Cloud Gateway /api/auth/*)
 */
export const authApi = {
  /**
   * Login user and save JWT token
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  /**
   * Register a new user
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  /**
   * Get current authenticated user profile
   */
  async getProfile(): Promise<Assignee> {
    return apiRequest<Assignee>('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Logout user and clear stored JWT
   */
  logout(): void {
    removeAuthToken();
  }
};
