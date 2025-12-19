import { api } from './client';
import type { ApiResponse, User, LoginCredentials, RegisterData } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  register: async (data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string }): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  },

  searchUsers: async (query: string): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>(`/auth/search?q=${query}`);
    return response.data;
  },
};