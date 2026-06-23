import { apiRequest } from '../../lib/api';
import type { User } from '../auth/types';

export const getUsers = () => apiRequest<{ users: User[] }>('/api/users');
