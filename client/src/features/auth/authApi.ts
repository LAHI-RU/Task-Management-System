import { apiRequest } from '../../lib/api';
import type { AuthResponse } from './types';

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export const login = (input: LoginInput) =>
  apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: input,
  });

export const register = (input: RegisterInput) =>
  apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: input,
  });

export const logout = () =>
  apiRequest<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });

export const getMe = () => apiRequest<AuthResponse>('/api/auth/me');
