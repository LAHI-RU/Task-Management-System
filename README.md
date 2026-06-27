# FlowBoard

FlowBoard is a full-stack task management system built for the Newnop Associate Software Engineer - Full Stack assignment. The application supports team task tracking with authentication, role-based access, task assignment, workflow status updates, filtering, pagination, and a dashboard summary.

## Live Demo

```text
Frontend: https://flowboard-7v6s.onrender.com
API:      https://flowboard-api-rbjh.onrender.com
Health:   https://flowboard-api-rbjh.onrender.com/api/health
```

Free Render services may take a short time to wake up after inactivity.

## Demo Accounts

```text
Admin
Email: admin@flowboard.dev
Password: Admin@12345

User
Email: user@flowboard.dev
Password: User@12345
```

## Features

- User registration and login with HTTP-only cookie authentication
- Admin and user roles
- Admins can view all users and all tasks
- Users can view tasks they created or tasks assigned to them
- Create, update, view, and delete tasks
- Assign tasks to users
- Track task status: Open, In Progress, Testing, Done
- Track task priority: Low, Medium, High
- Search tasks by title or description
- Filter tasks by status and priority
- Backend pagination for task lists
- Dashboard summary for task counts, overdue tasks, and upcoming tasks
- Responsive professional UI for desktop and smaller screens

## Tech Stack

Frontend:

- React
- Vite
- TypeScript
- TanStack Query
- React Router
- React Hook Form
- Zod
- Lucide React

Backend:

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- MySQL / TiDB Cloud
- JWT
- bcryptjs
- HTTP-only cookies
- Helmet
- CORS

Development and tooling:

- npm workspaces
- oxlint
- Prettier
- Docker Compose for local MySQL

## Project Structure

```text
client/             React frontend
server/             Express API
server/prisma/      Prisma schema, migrations, and seed script
docker-compose.yml  Local MySQL service
```

## Requirements

- Node.js 20 or newer
- npm
- MySQL 8 or Docker

## Local Setup

Install dependencies from the project root:

```bash
npm install
```

Create local environment files:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

Start the local MySQL database with Docker:

```bash
docker compose up -d
```

If you are using a locally installed MySQL server instead of Docker, create the database and user manually:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS flowboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'flowboard'@'localhost' IDENTIFIED BY 'flowboard_password'; GRANT ALL PRIVILEGES ON flowboard.* TO 'flowboard'@'localhost'; FLUSH PRIVILEGES;"
```

Generate the Prisma client, run migrations, and seed demo users:

```bash
npm run prisma:generate -w server
npm run prisma:migrate -w server -- --name init
npm run seed -w server
```

Start the application:

```bash
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:5173
API:      http://localhost:5000
Health:   http://localhost:5000/api/health
```

## Environment Variables

Client `.env`:

```text
VITE_API_URL=http://localhost:5000
```

Server `.env`:

```text
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
CLIENT_ORIGINS=http://localhost:5173,http://localhost:5174
DATABASE_URL="mysql://flowboard:flowboard_password@localhost:3306/flowboard"
JWT_SECRET="replace-this-with-a-long-random-secret-for-local-development"
JWT_EXPIRES_IN="7d"
```

For production, use secure values for `DATABASE_URL` and `JWT_SECRET`. Do not commit real production secrets.

## Available Commands

Run both frontend and backend in development mode:

```bash
npm run dev
```

Build both apps:

```bash
npm run build
```

Lint both apps:

```bash
npm run lint
```

Format files:

```bash
npm run format
```

Run Prisma Studio:

```bash
npm run prisma:studio -w server
```

Seed demo users:

```bash
npm run seed -w server
```

## API Summary

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

Supported task query parameters:

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

## Usage Guide

1. Log in with the admin demo account.
2. Create a task and assign it to a user.
3. Update task priority, status, description, assignee, or due date.
4. Use search and filters to narrow the task list.
5. Open a task to review its details.
6. Delete a task as an admin or as the task creator.
7. Log in with the user demo account to confirm role-based task visibility.

## Build Output

```text
client/dist  Frontend production build
server/dist  Backend production build
```

## Deployment

The submitted version is deployed using:

- Render Static Site for the frontend
- Render Web Service for the backend API
- TiDB Cloud Starter as the MySQL-compatible database

Production environment values used by the hosted services:

```text
Frontend:
VITE_API_URL=https://flowboard-api-rbjh.onrender.com

Backend:
NODE_ENV=production
CLIENT_ORIGIN=https://flowboard-7v6s.onrender.com
CLIENT_ORIGINS=https://flowboard-7v6s.onrender.com
DATABASE_URL=<production database URL>
JWT_SECRET=<production secret>
JWT_EXPIRES_IN=7d
```
