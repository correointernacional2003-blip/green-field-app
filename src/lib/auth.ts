import { AuthResponse } from './api';

export const AUTH_TOKEN_KEY = 'agrosmart_token';
export const AUTH_REFRESH_TOKEN_KEY = 'agrosmart_refresh_token';

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
