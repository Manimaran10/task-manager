import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';

export const useUsers = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['users', searchTerm],
    queryFn: () => usersApi.getUsers(),
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true, // Always enabled since we need users for dropdown
  });
};

export const useSearchUsers = (searchTerm: string) => {
  return useQuery({
    queryKey: ['users', 'search', searchTerm],
    queryFn: () => usersApi.searchUsers(searchTerm),
    select: (response) => response.data,
    enabled: searchTerm.length > 1, // Only search when 2+ characters
  });
};