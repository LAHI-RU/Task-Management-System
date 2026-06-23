import type { User } from '../auth/types';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DONE';

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  assignedToId: string;
  createdBy: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  assignedTo: Pick<User, 'id' | 'name' | 'email' | 'role'>;
};

export type TaskListFilters = {
  search?: string;
  priority?: TaskPriority | '';
  status?: TaskStatus | '';
  assignedToId?: string;
  createdById?: string;
  page?: number;
  pageSize?: number;
};

export type TaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedToId?: string;
};

export type TaskListResponse = {
  tasks: Task[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
};
