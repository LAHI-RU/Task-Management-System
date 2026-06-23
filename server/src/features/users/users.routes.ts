import { Router } from 'express';

import { asyncHandler } from '../../lib/async-handler.js';
import { prisma } from '../../lib/prisma.js';
import { sanitizeUser } from '../../lib/sanitize-user.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const usersRouter = Router();

usersRouter.get(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (_request, response) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    response.status(200).json({ users: users.map(sanitizeUser) });
  }),
);
