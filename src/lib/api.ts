import axios from 'axios';

const API_BASE_URL = 'https://sound-musical-seagull.ngrok-free.app';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrosmart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('agrosmart_token');
      localStorage.removeItem('agrosmart_refresh_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  dni: string;
  name: string;
  lastName: string;
  farm: {
    name: string;
    description: string;
    location: string;
  };
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    console.log('🔐 Intentando login con datos:', { email: data.email, hasPassword: !!data.password });
    try {
      const response = await api.post('/api/auth/login', data);
      console.log('✅ Login exitoso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en login:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log('📝 Intentando registro con datos:', {
      email: data.email,
      dni: data.dni,
      name: data.name,
      lastName: data.lastName,
      farm: data.farm,
      hasPassword: !!data.password
    });
    try {
      const response = await api.post('/api/auth/register', data);
      console.log('✅ Registro exitoso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en registro:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
};

// Generic API helpers for CRUD operations
export const createCRUDAPI = <T>(endpoint: string) => ({
  getAll: async (farmId: number, params?: any) => {
    const response = await api.get(`/api/farm/${farmId}${endpoint}`, { params });
    return response.data;
  },

  getById: async (farmId: number, id: number) => {
    const response = await api.get(`/api/farm/${farmId}${endpoint}/${id}`);
    return response.data;
  },

  create: async (farmId: number, data: Partial<T>) => {
    const response = await api.post(`/api/farm/${farmId}${endpoint}`, data);
    return response.data;
  },

  update: async (farmId: number, id: number, data: Partial<T>) => {
    const response = await api.put(`/api/farm/${farmId}${endpoint}/${id}`, data);
    return response.data;
  },

  delete: async (farmId: number, id: number) => {
    const response = await api.delete(`/api/farm/${farmId}${endpoint}/${id}`);
    return response.data;
  },
});
