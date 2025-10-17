import { AuthResponse } from './api';

export const AUTH_TOKEN_KEY = 'agrosmart_token';
export const AUTH_USER_KEY = 'agrosmart_user';

export const saveAuth = (data: AuthResponse) => {
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
};

export const getToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getUser = () => {
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
