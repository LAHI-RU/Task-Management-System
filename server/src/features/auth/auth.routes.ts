import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { env } from '../../config/env.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { signAuthToken } from '../../lib/auth-token.js';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { sanitizeUser } from '../../lib/sanitize-user.js';
import { requireAuth } from '../../middleware/auth.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: env.isProduction ? ('none' as const) : ('lax' as const),
  secure: env.isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

authRouter.post(
  '/register',
  asyncHandler(async (request, response) => {
    const data = registerSchema.parse(request.body);
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new HttpError(409, 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
    });

    const token = signAuthToken({ sub: user.id, role: user.role });

    response.cookie('accessToken', token, cookieOptions);
    response.status(201).json({ user: sanitizeUser(user) });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (request, response) => {
    const data = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    const token = signAuthToken({ sub: user.id, role: user.role });

    response.cookie('accessToken', token, cookieOptions);
    response.status(200).json({ user: sanitizeUser(user) });
  }),
);

authRouter.post('/logout', (_request, response) => {
  response.clearCookie('accessToken', cookieOptions);
  response.status(200).json({ message: 'Logged out successfully.' });
});

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (request, response) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.user?.id },
    });

    response.status(200).json({ user: sanitizeUser(user) });
  }),
);
