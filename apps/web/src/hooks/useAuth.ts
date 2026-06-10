import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@adminhub/shared';

export function useAuth() {
  const { user, isAuthenticated, setUser, setAccessToken, logout } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AuthUser }>('/auth/me');
      return res.data.data;
    },
    enabled: !!useAuthStore.getState().accessToken,
    retry: false,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  return { user, isAuthenticated, isLoading, setAccessToken, logout };
}
