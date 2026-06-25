import { z } from 'zod';

export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const taskStatusSchema = z.enum([
  'OPEN',
  'IN_PROGRESS',
  'TESTING',
  'DONE',
]);

const dueDateSchema = z.coerce
  .date()
  .refine((date) => !Number.isNaN(date.getTime()), 'Due date is invalid.');

export const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(1).max(2000),
  priority: taskPrioritySchema.default('MEDIUM'),
  status: taskStatusSchema.default('OPEN'),
  dueDate: dueDateSchema,
  assignedToId: z.string().trim().min(1).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
    dueDate: dueDateSchema.optional(),
    assignedToId: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required.',
  });

export const listTasksSchema = z.object({
  search: z.string().trim().optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  assignedToId: z.string().trim().min(1).optional(),
  createdById: z.string().trim().min(1).optional(),
  dueFrom: dueDateSchema.optional(),
  dueTo: dueDateSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(15),
});

export const taskParamsSchema = z.object({
  taskId: z.string().trim().min(1),
});
