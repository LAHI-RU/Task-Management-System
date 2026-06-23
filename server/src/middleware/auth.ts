import type { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import { verifyAuthToken } from '../lib/auth-token.js';
import { HttpError } from '../lib/http-error.js';
import { prisma } from '../lib/prisma.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export const requireAuth = async (
  request: Request,
  _response: Response,
  next: NextFunction,
) => {
  try {
    const token = request.cookies?.accessToken as string | undefined;

    if (!token) {
      throw new HttpError(401, 'Authentication required.');
    }

    const payload = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new HttpError(401, 'Authentication required.');
    }

    request.user = user;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Invalid session.'));
  }
};

export const requireRole =
  (...roles: Role[]) =>
  (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      next(new HttpError(401, 'Authentication required.'));
      return;
    }

    if (!roles.includes(request.user.role)) {
      next(new HttpError(403, 'You do not have permission to perform this action.'));
      return;
    }

    next();
  };
