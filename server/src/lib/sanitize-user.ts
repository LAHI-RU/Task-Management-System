import type { Role, User } from '@prisma/client';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
};

export const sanitizeUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});
