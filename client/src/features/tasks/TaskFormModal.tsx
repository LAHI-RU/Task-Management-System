import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import type { User } from '../auth/types';
import { taskPriorities, taskStatuses } from './taskOptions';
import type { Task, TaskInput } from './types';

const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').max(120),
  description: z.string().min(1, 'Description is required.').max(2000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'TESTING', 'DONE']),
  dueDate: z.string().min(1, 'Due date is required.'),
  assignedToId: z.string().optional(),
});

type TaskFormErrors = Partial<Record<keyof TaskInput, string>>;

type TaskFormModalProps = {
  currentUserId: string;
  isAdmin: boolean;
  isOpen: boolean;
  isSaving: boolean;
  task?: Task | null;
  users: User[];
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<void>;
};

const toDateInputValue = (date: string) => {
  const parsedDate = new Date(date);
  const offset = parsedDate.getTimezoneOffset() * 60_000;
  return new Date(parsedDate.getTime() - offset).toISOString().slice(0, 16);
};

const readFormValue = (formData: FormData, key: string) =>
  String(formData.get(key) ?? '');

export function TaskFormModal({
  currentUserId,
  isAdmin,
  isOpen,
  isSaving,
  task,
  users,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [errors, setErrors] = useState<TaskFormErrors>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen, task?.id]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = taskFormSchema.safeParse({
      title: readFormValue(formData, 'title'),
      description: readFormValue(formData, 'description'),
      priority: readFormValue(formData, 'priority'),
      status: readFormValue(formData, 'status'),
      dueDate: readFormValue(formData, 'dueDate'),
      assignedToId: readFormValue(formData, 'assignedToId') || currentUserId,
    });

    if (!parsed.success) {
      const nextErrors: TaskFormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof TaskInput | undefined;

        if (field) {
          nextErrors[field] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      ...parsed.data,
      dueDate: new Date(parsed.data.dueDate).toISOString(),
      assignedToId: parsed.data.assignedToId || currentUserId,
    });
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" aria-modal="true" role="dialog">
        <header className="modal-header">
          <div>
            <h3>{task ? 'Edit task' : 'Create task'}</h3>
            <p>{task ? 'Update task details and workflow status.' : 'Add a task to the workflow.'}</p>
          </div>
          <button aria-label="Close" className="icon-button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="task-title">Title</label>
            <input
              defaultValue={task?.title ?? ''}
              id="task-title"
              name="title"
            />
            {errors.title ? <span className="field-error">{errors.title}</span> : null}
          </div>

          <div className="field">
            <label htmlFor="task-description">Description</label>
            <textarea
              defaultValue={task?.description ?? ''}
              id="task-description"
              name="description"
              rows={4}
            />
            {errors.description ? (
              <span className="field-error">{errors.description}</span>
            ) : null}
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <select
                defaultValue={task?.priority ?? 'MEDIUM'}
                id="task-priority"
                name="priority"
              >
                {taskPriorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="task-status">Status</label>
              <select
                defaultValue={task?.status ?? 'OPEN'}
                id="task-status"
                name="status"
              >
                {taskStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="task-due-date">Due date</label>
              <input
                defaultValue={task?.dueDate ? toDateInputValue(task.dueDate) : ''}
                id="task-due-date"
                name="dueDate"
                type="datetime-local"
              />
              {errors.dueDate ? <span className="field-error">{errors.dueDate}</span> : null}
            </div>

            <div className="field">
              <label htmlFor="task-assignee">Assignee</label>
              <select
                defaultValue={task?.assignedToId ?? currentUserId}
                disabled={!isAdmin && task?.createdById !== currentUserId}
                id="task-assignee"
                name="assignedToId"
              >
                {!isAdmin && users.length === 0 ? (
                  <option value={currentUserId}>Me</option>
                ) : null}
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button className="ghost-button" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="primary-button" disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
