import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

import { env } from '../config/env.js';

export type AuthTokenPayload = {
  sub: string;
  role: 'ADMIN' | 'USER';
};

export const signAuthToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as StringValue,
  });

export const verifyAuthToken = (token: string) =>
  jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
