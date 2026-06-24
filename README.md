# FlowBoard - Task Management System

FlowBoard is a full-stack task management system built for the Newnop Associate Software Engineer assignment. It supports task creation, assignment, workflow tracking, role-based visibility, authentication, search, filtering, and a polished React UI.

## Features

- User registration and login
- HTTP-only cookie based JWT sessions
- Admin and User roles
- Admin can view all users and all tasks
- Users can view tasks they created or tasks assigned to them
- Create, view, update, and delete tasks
- Task priorities: Low, Medium, High
- Task statuses: Open, In Progress, Testing, Done
- Task detail panel
- Search by title or description
- Filter by status and priority
- Dashboard with task counts, upcoming work, and overdue summary
- Responsive professional UI

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Express.js, Node.js, TypeScript
- Database: MySQL
- ORM: Prisma
- Validation: Zod
- Forms: React Hook Form
- Data fetching: TanStack Query
- Icons: Lucide React
- Auth: JWT, bcryptjs, HTTP-only cookies

## Project Structure

```text
client/             React frontend
server/             Express API
server/prisma/      Prisma schema, migration, and seed script
docker-compose.yml  Optional local MySQL container
```

## Requirements

- Node.js 20 or newer
- MySQL 8 or newer
- npm

Docker is optional. The project also works with WampServer MySQL.

## Local Setup

Install dependencies:

```bash
npm install
```

Create environment files:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

If you are using WampServer MySQL, create the database and user:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS flowboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'flowboard'@'localhost' IDENTIFIED BY 'flowboard_password'; GRANT ALL PRIVILEGES ON flowboard.* TO 'flowboard'@'localhost'; GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO 'flowboard'@'localhost'; FLUSH PRIVILEGES;"
```

If you prefer Docker, start MySQL with:

```bash
docker compose up -d
```

Generate Prisma client, migrate the database, and seed demo users:

```bash
npm run prisma:generate -w server
npm run prisma:migrate -w server -- --name init
npm run seed -w server
```

Start the app:

```bash
npm run dev
```

Default local URLs:

- Frontend: http://localhost:5173
- API health: http://localhost:5000/api/health

Vite may use `5174` if `5173` is already occupied. The backend allows local Vite ports in development.

## Demo Accounts

```text
Admin
Email: admin@flowboard.dev
Password: Admin@12345

User
Email: user@flowboard.dev
Password: User@12345
```

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run prisma:studio -w server
npm run seed -w server
```

## API Endpoints

Auth:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Users:

```text
GET /api/users
```

Tasks:

```text
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:taskId
PATCH  /api/tasks/:taskId
DELETE /api/tasks/:taskId
```

Task query filters:

```text
search
priority
status
assignedToId
createdById
dueFrom
dueTo
page
pageSize
```

## Environment Variables

Frontend:

```text
VITE_API_URL=http://localhost:5000
```

Backend:

```text
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
CLIENT_ORIGINS=http://localhost:5173,http://localhost:5174
DATABASE_URL=mysql://flowboard:flowboard_password@localhost:3306/flowboard
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=7d
```

For production, set:

```text
NODE_ENV=production
CLIENT_ORIGINS=https://your-frontend-domain.com
DATABASE_URL=your-hosted-mysql-url
JWT_SECRET=a-long-random-production-secret
VITE_API_URL=https://your-backend-domain.com
```

## Deployment Notes

Recommended simple deployment:

- Frontend: Vercel or Netlify
- Backend: Render, Railway, Fly.io, or AWS
- Database: Railway MySQL, PlanetScale, Aiven, AWS RDS, or another hosted MySQL provider

Backend production commands:

```bash
npm install
npm run build -w server
npm run prisma:deploy -w server
npm run seed -w server
npm run start -w server
```

Frontend production commands:

```bash
npm install
npm run build -w client
```

Frontend output directory:

```text
client/dist
```

## Verification

The project has been verified with:

```bash
npm run build
npm run lint
npm audit --workspace client
npm audit --workspace server
```

Manual browser checks covered:

- Login/logout
- Protected route redirect
- Dashboard task summary
- Create task
- Search/filter task
- Edit task
- Delete task
- Admin/user role visibility
