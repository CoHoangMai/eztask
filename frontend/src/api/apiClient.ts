/**
 * Centralized API Client for Cloud-Native Microservices Gateway
 * Routes requests to Spring Cloud Gateway (default: http://localhost:8080/api)
 * Automatically attaches JWT Bearer token and handles error states & offline fallback.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'eztask_jwt_token';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Core HTTP Request Wrapper
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      removeAuthToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new Error('Unauthorized: Session expired, please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}: ${response.statusText}`);
    }

    // Return JSON data or empty object if 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    // Flag network failure for offline fallback handling
    console.warn(`[API Client] Request to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/actuator/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
};
