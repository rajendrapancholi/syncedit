import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './authStore';
import { LoginPayload, LoginResponse } from './authType';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { disconnectSocket } from '@/hooks/useSocket';

export function useGetUserQuery() {
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        setCredentials(data.user);
        return data;
      } catch (err) {
        clearCredentials();
        throw err;
      }
    },
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<LoginResponse> => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Login failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
      setCredentials(data.user);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err: any) => {
      if (err?.status) {
        console.error('Status:', err.status);
      }
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearCredentials = useAuthStore((state) => state.clearCredentials);
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Logout failed');
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success('Logged out successfully!');
      queryClient.setQueryData(['user'], null);
      disconnectSocket(); 
      clearCredentials();
      router.push('/login');
    },
    onError: (error) => {
      toast.dismiss();
      toast.error('Failed to sign out.');
      console.error(error);
    },
  });
}
