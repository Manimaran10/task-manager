import { api } from './client';
import type { ApiResponse, User } from '../types';

export const usersApi = {
  getUsers: async () => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data;
  },

  searchUsers: async (search: string) => {
    const response = await api.get<ApiResponse<User[]>>('/users/search', {
      params: { search }
    });
    return response.data;
  }
};