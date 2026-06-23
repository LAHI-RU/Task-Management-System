export type UserRole = 'ADMIN' | 'USER';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
};
