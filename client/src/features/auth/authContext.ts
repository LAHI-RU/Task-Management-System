import { createContext } from 'react';

import type { LoginInput, RegisterInput } from './authApi';
import type { User } from './types';

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  loginUser: (input: LoginInput) => Promise<void>;
  registerUser: (input: RegisterInput) => Promise<void>;
  logoutUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
