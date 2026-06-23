import type { Prisma } from '@prisma/client';
import { Router } from 'express';

import { asyncHandler } from '../../lib/async-handler.js';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  createTaskSchema,
  listTasksSchema,
  taskParamsSchema,
  updateTaskSchema,
} from './tasks.schemas.js';

export const tasksRouter = Router();

const taskInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.TaskInclude;

const visibleTaskWhere = (user: NonNullable<Express.Request['user']>) => {
  if (user.role === 'ADMIN') {
    return {};
  }

  return {
    OR: [{ createdById: user.id }, { assignedToId: user.id }],
  } satisfies Prisma.TaskWhereInput;
};

const findVisibleTask = async (
  taskId: string,
  user: NonNullable<Express.Request['user']>,
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      ...visibleTaskWhere(user),
    },
    include: taskInclude,
  });

  if (!task) {
    throw new HttpError(404, 'Task not found.');
  }

  return task;
};

const assertAssigneeExists = async (assignedToId: string) => {
  const assignee = await prisma.user.findUnique({
    where: { id: assignedToId },
    select: { id: true },
  });

  if (!assignee) {
    throw new HttpError(400, 'Assigned user does not exist.');
  }
};

tasksRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (request, response) => {
    const query = listTasksSchema.parse(request.query);
    const filters: Prisma.TaskWhereInput[] = [];

    if (query.search) {
      filters.push({
        OR: [
          { title: { contains: query.search } },
          { description: { contains: query.search } },
        ],
      });
    }

    if (query.priority) {
      filters.push({ priority: query.priority });
    }

    if (query.status) {
      filters.push({ status: query.status });
    }

    if (query.assignedToId) {
      filters.push({ assignedToId: query.assignedToId });
    }

    if (query.createdById) {
      filters.push({ createdById: query.createdById });
    }

    if (query.dueFrom || query.dueTo) {
      filters.push({
        dueDate: {
          ...(query.dueFrom ? { gte: query.dueFrom } : {}),
          ...(query.dueTo ? { lte: query.dueTo } : {}),
        },
      });
    }

    const where: Prisma.TaskWhereInput = {
      AND: [visibleTaskWhere(request.user!), ...filters],
    };

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.task.count({ where }),
    ]);

    response.status(200).json({
      tasks,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        pageCount: Math.ceil(total / query.pageSize),
      },
    });
  }),
);

tasksRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (request, response) => {
    const data = createTaskSchema.parse(request.body);
    const assignedToId = data.assignedToId ?? request.user!.id;

    await assertAssigneeExists(assignedToId);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
        createdById: request.user!.id,
        assignedToId,
      },
      include: taskInclude,
    });

    response.status(201).json({ task });
  }),
);

tasksRouter.get(
  '/:taskId',
  requireAuth,
  asyncHandler(async (request, response) => {
    const { taskId } = taskParamsSchema.parse(request.params);
    const task = await findVisibleTask(taskId, request.user!);

    response.status(200).json({ task });
  }),
);

tasksRouter.patch(
  '/:taskId',
  requireAuth,
  asyncHandler(async (request, response) => {
    const { taskId } = taskParamsSchema.parse(request.params);
    const data = updateTaskSchema.parse(request.body);
    const existingTask = await findVisibleTask(taskId, request.user!);

    if (
      data.assignedToId &&
      request.user!.role !== 'ADMIN' &&
      existingTask.createdById !== request.user!.id
    ) {
      throw new HttpError(403, 'Only task creators or admins can reassign tasks.');
    }

    if (data.assignedToId) {
      await assertAssigneeExists(data.assignedToId);
    }

    const task = await prisma.task.update({
      where: { id: existingTask.id },
      data,
      include: taskInclude,
    });

    response.status(200).json({ task });
  }),
);

tasksRouter.delete(
  '/:taskId',
  requireAuth,
  asyncHandler(async (request, response) => {
    const { taskId } = taskParamsSchema.parse(request.params);
    const existingTask = await findVisibleTask(taskId, request.user!);

    if (
      request.user!.role !== 'ADMIN' &&
      existingTask.createdById !== request.user!.id
    ) {
      throw new HttpError(403, 'Only task creators or admins can delete tasks.');
    }

    await prisma.task.delete({
      where: { id: existingTask.id },
    });

    response.status(204).send();
  }),
);
