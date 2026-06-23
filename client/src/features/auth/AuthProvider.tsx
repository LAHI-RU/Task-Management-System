import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiError } from '../../lib/api';
import { getMe, login, logout, register } from './authApi';
import type { LoginInput, RegisterInput } from './authApi';
import type { User } from './types';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
  });

  useEffect(() => {
    if (meQuery.data?.user) {
      setUser(meQuery.data.user);
    }
  }, [meQuery.data?.user]);

  useEffect(() => {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401) {
      setUser(null);
    }
  }, [meQuery.error]);

  const loginUser = useCallback(
    async (input: LoginInput) => {
      const response = await login(input);
      setUser(response.user);
      queryClient.setQueryData(['auth', 'me'], response);
    },
    [queryClient],
  );

  const registerUser = useCallback(
    async (input: RegisterInput) => {
      const response = await register(input);
      setUser(response.user);
      queryClient.setQueryData(['auth', 'me'], response);
    },
    [queryClient],
  );

  const logoutUser = useCallback(async () => {
    await logout();
    setUser(null);
    queryClient.removeQueries({ queryKey: ['auth'] });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isLoading: meQuery.isLoading,
      loginUser,
      registerUser,
      logoutUser,
    }),
    [loginUser, logoutUser, meQuery.isLoading, registerUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
