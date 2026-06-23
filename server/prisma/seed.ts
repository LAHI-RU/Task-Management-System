import bcrypt from 'bcryptjs';

import { prisma } from '../src/lib/prisma.js';

const users = [
  {
    name: 'Admin User',
    email: 'admin@flowboard.dev',
    password: 'Admin@12345',
    role: 'ADMIN' as const,
  },
  {
    name: 'Demo User',
    email: 'user@flowboard.dev',
    password: 'User@12345',
    role: 'USER' as const,
  },
];

for (const user of users) {
  const passwordHash = await bcrypt.hash(user.password, 12);

  await prisma.user.upsert({
    where: { email: user.email },
    create: {
      email: user.email,
      name: user.name,
      passwordHash,
      role: user.role,
    },
    update: {
      name: user.name,
      passwordHash,
      role: user.role,
    },
  });
}

await prisma.$disconnect();

console.log('Seeded demo users: admin@flowboard.dev and user@flowboard.dev');
