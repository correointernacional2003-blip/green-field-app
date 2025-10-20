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

// Response interceptor to handle errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 or 403 errors (token expired)
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('agrosmart_refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh the token
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          }
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        localStorage.setItem('agrosmart_token', token);
        localStorage.setItem('agrosmart_refresh_token', newRefreshToken);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('agrosmart_token');
        localStorage.removeItem('agrosmart_refresh_token');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
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

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  paginationInfo: {
    currentPage: number;
    size: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
}

// Animal types
export interface Animal {
  id?: number;
  code: string;
  name: string;
  birthday: string;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  sex: 'MALE' | 'FEMALE';
  registerType: 'BIRTH' | 'PURCHASE';
  health: 'HEALTHY' | 'SICK' | 'QUARANTINE';
  birthWeight?: number;
  status: 'ACTIVE' | 'SOLD' | 'DECEASED' | 'TRANSFERRED';
  color?: string;
  brand?: string;
  razaId: number;
  lotId: number;
  paddockId: number;
  fatherId?: number | null;
  motherId?: number | null;
  farmId?: number;
  createdAt?: string;
}

// Generic API helpers for CRUD operations with pagination
export const createCRUDAPI = <T>(endpoint: string) => ({
  getAll: async (farmId: number, params?: any): Promise<PaginatedResponse<T>> => {
    const response = await api.get(`/api/farm/${farmId}${endpoint}`, { params });
    return response.data;
  },

  getById: async (farmId: number, id: number): Promise<T> => {
    const response = await api.get(`/api/farm/${farmId}${endpoint}/${id}`);
    return response.data;
  },

  create: async (farmId: number, data: Partial<T>): Promise<T> => {
    const response = await api.post(`/api/farm/${farmId}${endpoint}`, data);
    return response.data;
  },

  update: async (farmId: number, id: number, data: Partial<T>): Promise<T> => {
    const response = await api.patch(`/api/farm/${farmId}${endpoint}/${id}`, data);
    return response.data;
  },

  delete: async (farmId: number, id: number): Promise<void> => {
    const response = await api.delete(`/api/farm/${farmId}${endpoint}/${id}`);
    return response.data;
  },
});

// Generic API helpers for CRUD operations without pagination (returns array directly)
export const createSimpleCRUDAPI = <T>(endpoint: string) => ({
  getAll: async (farmId: number): Promise<T[]> => {
    const response = await api.get(`/api/farm/${farmId}${endpoint}`);
    return response.data;
  },

  getById: async (farmId: number, id: number): Promise<T> => {
    const response = await api.get(`/api/farm/${farmId}${endpoint}/${id}`);
    return response.data;
  },

  create: async (farmId: number, data: Partial<T>): Promise<T> => {
    const response = await api.post(`/api/farm/${farmId}${endpoint}`, data);
    return response.data;
  },

  update: async (farmId: number, id: number, data: Partial<T>): Promise<T> => {
    const response = await api.patch(`/api/farm/${farmId}${endpoint}/${id}`, data);
    return response.data;
  },

  delete: async (farmId: number, id: number): Promise<void> => {
    const response = await api.delete(`/api/farm/${farmId}${endpoint}/${id}`);
    return response.data;
  },
});

// Breed types
export interface Breed {
  id?: number;
  name: string;
  description?: string;
  farmId?: number;
}

// Lot types
export interface Lot {
  id?: number;
  name: string;
  description?: string;
}

// Paddock types
export interface Paddock {
  id?: number;
  name: string;
  surface?: number;
  grassType?: 'PASTURE' | 'CORRAL' | 'STABLE' | 'OTHER';
  location?: string;
  description?: string;
  farmId?: number;
}

// Animals API (paginated)
export const animalsAPI = createCRUDAPI<Animal>('/animals');

// Breeds API (not paginated - returns array directly)
export const breedsAPI = createSimpleCRUDAPI<Breed>('/breeds');

// Lots API (not paginated - returns array directly)
export const lotsAPI = createSimpleCRUDAPI<Lot>('/lots');

// Paddocks API (not paginated - returns array directly)
export const paddocksAPI = createSimpleCRUDAPI<Paddock>('/paddocks');
