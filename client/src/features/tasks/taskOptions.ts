import type { TaskPriority, TaskStatus } from './types';

export const taskStatuses: Array<{ value: TaskStatus; label: string }> = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'DONE', label: 'Done' },
];

export const taskPriorities: Array<{ value: TaskPriority; label: string }> = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export const getStatusLabel = (status: TaskStatus) =>
  taskStatuses.find((item) => item.value === status)?.label ?? status;

export const getPriorityLabel = (priority: TaskPriority) =>
  taskPriorities.find((item) => item.value === priority)?.label ?? priority;
