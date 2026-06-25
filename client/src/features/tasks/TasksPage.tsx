import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
import type {
  Task,
  TaskInput,
  TaskListFilters,
  TaskPriority,
  TaskStatus,
} from './types';

const emptyTasks: Task[] = [];
const NOTICE_VISIBLE_MS = 4_000;
const TASKS_PAGE_SIZE = 15;

type NoticeTone = 'success' | 'error';

type Notice = {
  id: number;
  message: string;
  tone: NoticeTone;
};

type DropdownOption<Value extends string> = {
  label: string;
  value: Value;
};

type FilterDropdownProps<Value extends string> = {
  allLabel: string;
  label: string;
  options: Array<DropdownOption<Value>>;
  value: Value | '';
  onChange: (value: Value | '') => void;
};

const optionTone = (value: string) => value.toLowerCase().replace(/_/g, '-');

function FilterDropdown<Value extends string>({
  allLabel,
  label,
  options,
  value,
  onChange,
}: FilterDropdownProps<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectValue = (nextValue: Value | '') => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="filter-dropdown-trigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span
          className={`filter-option-dot ${value ? `tone-${optionTone(value)}` : ''}`}
        />
        <span>{selectedOption?.label ?? allLabel}</span>
        <ChevronDown aria-hidden="true" size={16} />
      </button>

      {isOpen ? (
        <div aria-label={label} className="filter-dropdown-menu" role="listbox">
          <button
            aria-selected={value === ''}
            className="filter-dropdown-option"
            onClick={() => selectValue('')}
            role="option"
            type="button"
          >
            <span className="filter-option-dot" />
            <span>{allLabel}</span>
            {value === '' ? <Check aria-hidden="true" size={15} /> : null}
          </button>

          {options.map((option) => (
            <button
              aria-selected={value === option.value}
              className="filter-dropdown-option"
              key={option.value}
              onClick={() => selectValue(option.value)}
              role="option"
              type="button"
            >
              <span className={`filter-option-dot tone-${optionTone(option.value)}`} />
              <span>{option.label}</span>
              {value === option.value ? <Check aria-hidden="true" size={15} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
    pageSize: TASKS_PAGE_SIZE,
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeIdRef = useRef(0);

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
  const pagination = tasksQuery.data?.meta;
  const currentPage = filters.page ?? 1;
  const pageSize = filters.pageSize ?? TASKS_PAGE_SIZE;
  const pageCount = Math.max(pagination?.pageCount ?? 1, 1);
  const totalTasks = pagination?.total ?? 0;
  const firstTaskNumber = totalTasks === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastTaskNumber = Math.min(currentPage * pageSize, totalTasks);
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

  const showNotice = (message: string, tone: NoticeTone = 'success') => {
    noticeIdRef.current += 1;
    setNotice({
      id: noticeIdRef.current,
      message,
      tone,
    });
  };

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice((currentNotice) =>
        currentNotice?.id === notice.id ? null : currentNotice,
      );
    }, NOTICE_VISIBLE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  useEffect(() => {
    if (!pagination || tasksQuery.isFetching) {
      return;
    }

    const lastAvailablePage = Math.max(pagination.pageCount, 1);

    if (pagination.page > lastAvailablePage) {
      setFilters((current) => ({
        ...current,
        page: lastAvailablePage,
      }));
    }
  }, [pagination, tasksQuery.isFetching]);

  const saveTaskMutation = useMutation({
    mutationFn: async (input: TaskInput) => {
      if (editingTask) {
        return updateTask(editingTask.id, input);
      }

      return createTask(input);
    },
    onSuccess: async (response) => {
      showNotice(
        editingTask ? 'Task updated successfully.' : 'Task created successfully.',
      );
      setSelectedTaskId(response.task.id);
      setIsFormOpen(false);
      setEditingTask(null);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      showNotice(
        error instanceof ApiError ? error.message : 'Unable to save task.',
        'error',
      );
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      showNotice('Task deleted successfully.');
      setSelectedTaskId(null);
      setTaskToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      showNotice(
        error instanceof ApiError ? error.message : 'Unable to delete task.',
        'error',
      );
    },
  });

  useEffect(() => {
    if (!taskToDelete || deleteTaskMutation.isPending) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTaskToDelete(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteTaskMutation.isPending, taskToDelete]);

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
    setNotice(null);
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id);
    }
  };

  const goToPage = (page: number) => {
    setFilters((current) => ({
      ...current,
      page,
      pageSize: TASKS_PAGE_SIZE,
    }));
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

      {notice ? (
        <div className={`notice-banner notice-${notice.tone}`} role="status">
          {notice.message}
        </div>
      ) : null}

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

            <FilterDropdown<TaskStatus>
              allLabel="All statuses"
              label="Filter by status"
              options={taskStatuses}
              value={filters.status ?? ''}
              onChange={(status) =>
                setFilters((current) => ({
                  ...current,
                  status,
                  page: 1,
                }))
              }
            />

            <FilterDropdown<TaskPriority>
              allLabel="All priorities"
              label="Filter by priority"
              options={taskPriorities}
              value={filters.priority ?? ''}
              onChange={(priority) =>
                setFilters((current) => ({
                  ...current,
                  priority,
                  page: 1,
                }))
              }
            />
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

          <div className="table-pagination">
            <span>
              Showing {firstTaskNumber}-{lastTaskNumber} of {totalTasks} tasks
            </span>
            <div className="pagination-actions" aria-label="Task table pagination">
              <button
                className="icon-button"
                disabled={currentPage <= 1 || tasksQuery.isFetching}
                onClick={() => goToPage(currentPage - 1)}
                type="button"
              >
                <ChevronLeft size={17} />
              </button>
              <strong>
                Page {currentPage} of {pageCount}
              </strong>
              <button
                className="icon-button"
                disabled={currentPage >= pageCount || tasksQuery.isFetching}
                onClick={() => goToPage(currentPage + 1)}
                type="button"
              >
                <ChevronRight size={17} />
              </button>
            </div>
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

      {taskToDelete ? (
        <div className="confirm-backdrop" role="presentation">
          <section
            aria-labelledby="delete-task-title"
            aria-modal="true"
            className="confirm-dialog"
            role="dialog"
          >
            <div className="confirm-icon">
              <AlertTriangle size={22} />
            </div>
            <div className="confirm-content">
              <h3 id="delete-task-title">Delete this task?</h3>
              <p>
                <strong>{taskToDelete.title}</strong> will be permanently removed.
                This action cannot be undone.
              </p>
              <div className="confirm-actions">
                <button
                  className="ghost-button"
                  disabled={deleteTaskMutation.isPending}
                  onClick={() => setTaskToDelete(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="danger-button"
                  disabled={deleteTaskMutation.isPending}
                  onClick={confirmDelete}
                  type="button"
                >
                  {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete task'}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
