# FlowBoard - Task Management System

FlowBoard is a full-stack task management application built for the Newnop Associate Software Engineer assignment.

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Express.js, Node.js, TypeScript
- Database: MySQL with Prisma ORM
- Auth: JWT-based authentication with role-based access control

## Current Checkpoint

Checkpoint 1 sets up the monorepo, React client, Express API, shared developer tooling, and git baseline.

## Local Development

Install dependencies:

```bash
npm install
```

Run both apps:

```bash
npm run dev
```

Run only the frontend:

```bash
npm run dev -w client
```

Run only the backend:

```bash
npm run dev -w server
```

Default local URLs:

- Client: http://localhost:5173
- API health: http://localhost:5000/api/health

## Database Setup

The app uses MySQL through Prisma. If Docker is available, start MySQL with:

```bash
docker compose up -d
```

Create `server/.env` from `server/.env.example`, then run:

```bash
npm run prisma:generate -w server
npm run prisma:migrate -w server -- --name init
npm run seed -w server
```

Demo accounts:

- Admin: `admin@flowboard.dev` / `Admin@12345`
- User: `user@flowboard.dev` / `User@12345`

## API Checkpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`

Task filters:

- `search`
- `priority`
- `status`
- `assignedToId`
- `createdById`
- `dueFrom`
- `dueTo`
- `page`
- `pageSize`

## Frontend Demo

Run both apps and open the client:

```bash
npm run dev
```

- Client: http://localhost:5173
- Login page: http://localhost:5173/login
- Protected app: http://localhost:5173/app
