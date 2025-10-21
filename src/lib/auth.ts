import { AuthResponse } from './api';
import { jwtDecode } from 'jwt-decode';

export const AUTH_TOKEN_KEY = 'agrosmart_token';
export const AUTH_REFRESH_TOKEN_KEY = 'agrosmart_refresh_token';

interface DecodedToken {
  id: number;
  role: string;
  type: string;
  farms: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  sub: string;
  iat: number;
  exp: number;
}

export const saveAuth = (data: AuthResponse) => {
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken);
};

export const getToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getFarmId = (): number | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // Return the first farm's ID
    return decoded.farms?.[0]?.id || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
