import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { authRouter } from './features/auth/auth.routes.js';
import { tasksRouter } from './features/tasks/tasks.routes.js';
import { usersRouter } from './features/users/users.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.get('/api/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'flowboard-api',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/users', usersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
