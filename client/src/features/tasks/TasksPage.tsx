import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Filter, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ApiError } from '../../lib/api';
import { useAuth } from '../auth/useAuth';
import { getUsers } from '../users/usersApi';
import { TaskDetailPanel } from './TaskDetailPanel';
import { TaskFormModal } from './TaskFormModal';
import {
  getPriorityLabel,
  getStatusLabel,
  taskPriorities,
  taskStatuses,
} from './taskOptions';
import { createTask, deleteTask, getTasks, updateTask } from './tasksApi';
import type { Task, TaskInput, TaskListFilters } from './types';

const emptyTasks: Task[] = [];

const formatDueDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

export function TasksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TaskListFilters>({
    page: 1,
    pageSize: 20,
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const tasksQuery = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => getTasks(filters),
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: user?.role === 'ADMIN',
  });

  const tasks = tasksQuery.data?.tasks ?? emptyTasks;
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null,
    [selectedTaskId, tasks],
  );

  const userOptions =
    user?.role === 'ADMIN'
      ? usersQuery.data?.users ?? []
      : user
        ? [user]
        : [];

  const saveTaskMutation = useMutation({
    mutationFn: async (input: TaskInput) => {
      if (editingTask) {
        return updateTask(editingTask.id, input);
      }

      return createTask(input);
    },
    onSuccess: async (response) => {
      setNotice(editingTask ? 'Task updated successfully.' : 'Task created successfully.');
      setSelectedTaskId(response.task.id);
      setIsFormOpen(false);
      setEditingTask(null);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      setNotice(error instanceof ApiError ? error.message : 'Unable to save task.');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      setNotice('Task deleted successfully.');
      setSelectedTaskId(null);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      setNotice(error instanceof ApiError ? error.message : 'Unable to delete task.');
    },
  });

  const canDelete = (task: Task) =>
    user?.role === 'ADMIN' || task.createdById === user?.id;

  const openCreateForm = () => {
    setNotice(null);
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setNotice(null);
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = (task: Task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`);

    if (confirmed) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  return (
    <>
      <section className="page-header">
        <div>
          <h2>Tasks</h2>
          <p>
            Search, filter, assign, update, and review tasks with role-aware
            visibility.
          </p>
        </div>
        <button className="primary-button" onClick={openCreateForm} type="button">
          <Plus size={17} />
          Create task
        </button>
      </section>

      {notice ? <div className="notice-banner">{notice}</div> : null}

      <section className="task-workspace">
        <div className="task-list-panel">
          <div className="filter-bar">
            <label className="search-field">
              <Search size={17} />
              <input
                placeholder="Search title or description"
                value={filters.search ?? ''}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value,
                    page: 1,
                  }))
                }
              />
            </label>

            <label>
              <Filter size={16} />
              <select
                value={filters.status ?? ''}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as TaskListFilters['status'],
                    page: 1,
                  }))
                }
              >
                <option value="">All statuses</option>
                {taskStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <Filter size={16} />
              <select
                value={filters.priority ?? ''}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    priority: event.target.value as TaskListFilters['priority'],
                    page: 1,
                  }))
                }
              >
                <option value="">All priorities</option>
                {taskPriorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="table-wrap">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Due</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {tasksQuery.isLoading ? (
                  <tr>
                    <td colSpan={6}>Loading tasks...</td>
                  </tr>
                ) : null}

                {!tasksQuery.isLoading && tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No tasks match the current filters.</td>
                  </tr>
                ) : null}

                {tasks.map((task) => (
                  <tr
                    className={task.id === selectedTask?.id ? 'selected-row' : ''}
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <td>
                      <strong>{task.title}</strong>
                      <span>{task.createdBy.name}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${task.status.toLowerCase()}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </td>
                    <td>{task.assignedTo.name}</td>
                    <td>{formatDueDate(task.dueDate)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditForm(task);
                          }}
                          type="button"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="icon-button danger"
                          disabled={!canDelete(task)}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(task);
                          }}
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TaskDetailPanel
          canDelete={selectedTask ? canDelete(selectedTask) : false}
          task={selectedTask}
          onDelete={handleDelete}
          onEdit={openEditForm}
        />
      </section>

      <TaskFormModal
        currentUserId={user?.id ?? ''}
        isAdmin={user?.role === 'ADMIN'}
        isOpen={isFormOpen}
        isSaving={saveTaskMutation.isPending}
        task={editingTask}
        users={userOptions}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={async (input) => {
          await saveTaskMutation.mutateAsync(input);
        }}
      />
    </>
  );
}
