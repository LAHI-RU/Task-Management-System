# FlowBoard

FlowBoard is a full-stack task management app built with React, Express, Prisma, and MySQL. It includes authentication, role-based access, task assignment, workflow statuses, filtering, pagination, and a dashboard summary.

## Features

- Register and sign in with HTTP-only cookie sessions
- Admin and user roles
- Admins can view all users and tasks
- Users can view tasks they created or tasks assigned to them
- Create, update, view, and delete tasks
- Task priority and workflow status tracking
- Search and filter tasks by title, description, status, and priority
- Backend pagination for the task list
- Dashboard with status counts, upcoming work, and overdue tasks

## Tech Stack

- React, Vite, TypeScript
- Express, Node.js, TypeScript
- MySQL, Prisma
- TanStack Query
- React Hook Form
- Zod
- JWT, bcryptjs, HTTP-only cookies
- Lucide React

## Project Structure

```text
client/             React frontend
server/             Express API
server/prisma/      Prisma schema, migrations, and seed script
docker-compose.yml  Local MySQL container
```

## Requirements

- Node.js 20 or newer
- npm
- MySQL 8 or Docker

## Setup

Install dependencies:

```bash
npm install
```

Create environment files:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

Start MySQL with Docker:

```bash
docker compose up -d
```

If you are using a local MySQL installation instead, create a database and user that match `server/.env`:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS flowboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'flowboard'@'localhost' IDENTIFIED BY 'flowboard_password'; GRANT ALL PRIVILEGES ON flowboard.* TO 'flowboard'@'localhost'; FLUSH PRIVILEGES;"
```

Prepare the database:

```bash
npm run prisma:generate -w server
npm run prisma:migrate -w server -- --name init
npm run seed -w server
```

Run the app:

```bash
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:5173
API:      http://localhost:5000
Health:   http://localhost:5000/api/health
```

## Demo Accounts

```text
Admin
Email: admin@flowboard.dev
Password: Admin@12345

User
Email: user@flowboard.dev
Password: User@12345
```

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run prisma:studio -w server
npm run seed -w server
```

## Environment

Client:

```text
VITE_API_URL=http://localhost:5000
```

Server:

```text
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
CLIENT_ORIGINS=http://localhost:5173,http://localhost:5174
DATABASE_URL="mysql://flowboard:flowboard_password@localhost:3306/flowboard"
JWT_SECRET="replace-this-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
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

## Build

```bash
npm run build
```

The frontend build output is created in `client/dist`. The server build output is created in `server/dist`.
