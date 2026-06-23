import { apiRequest } from '../../lib/api';
import type { Task, TaskInput, TaskListFilters, TaskListResponse } from './types';

const buildQuery = (filters: TaskListFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const getTasks = (filters?: TaskListFilters) =>
  apiRequest<TaskListResponse>(`/api/tasks${buildQuery(filters)}`);

export const createTask = (input: TaskInput) =>
  apiRequest<{ task: Task }>('/api/tasks', {
    method: 'POST',
    body: input,
  });

export const updateTask = (taskId: string, input: Partial<TaskInput>) =>
  apiRequest<{ task: Task }>(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: input,
  });

export const deleteTask = (taskId: string) =>
  apiRequest<void>(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
