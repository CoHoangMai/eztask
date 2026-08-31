/**
 * Centralized API Client for Cloud-Native Microservices Gateway
 * Routes requests to Spring Cloud Gateway (/api/*)
 * Automatically attaches JWT Bearer token and handles error states & offline fallback.
 */

// In development or container proxy, default to /api or explicit env var
const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  // Default to relative /api if served through proxy, or localhost:8080/api
  return '/api';
};

const API_BASE_URL = getBaseApiUrl();
const TOKEN_KEY = 'eztask_jwt_token';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
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
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

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
      removeAuthToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      throw new Error('Unauthorized: Session expired or invalid token.');
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = `${errorData.error}: ${errorData.message || response.statusText}`;
        }
      } catch {
        // Response was not JSON
      }
      throw new Error(errorMessage);
    }

    // Return empty object on 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    console.warn(`[API Client] Request to ${endpoint} failed:`, error.message);
    throw error;
  }
}

/**
 * Checks if Spring Cloud Gateway / Backend microservices are online
 */
export const isBackendAvailable = async (): Promise<boolean> => {
  // 1. Try direct /actuator/health endpoint on gateway proxy
  try {
    const res = await fetch('/actuator/health', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && (data.status === 'UP' || data.status === 'UNKNOWN')) {
        return true;
      }
    }
  } catch {}

  // 2. Try prefix-routed /api/actuator/health
  try {
    const res = await fetch(`${API_BASE_URL}/actuator/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return true;
  } catch {}

  // 3. Try open Auth Gateway route (/api/auth/me or /api/auth/login)
  try {
    const authPing = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2500),
    });
    // 200, 401 (gateway alive and intercepting JWT), 403 indicate gateway is UP
    if (authPing.status === 200 || authPing.status === 401 || authPing.status === 403) {
      return true;
    }
  } catch {}

  return false;
};
