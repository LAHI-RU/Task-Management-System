import { Check, ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import type { User } from '../auth/types';
import { taskPriorities, taskStatuses } from './taskOptions';
import type { Task, TaskInput, TaskPriority, TaskStatus } from './types';

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

type DropdownOption<Value extends string> = {
  label: string;
  value: Value;
};

type FormDropdownProps<Value extends string> = {
  disabled?: boolean;
  id: string;
  label: string;
  name: string;
  options: Array<DropdownOption<Value>>;
  value: Value;
  onChange: (value: Value) => void;
};

function FormDropdown<Value extends string>({
  disabled = false,
  id,
  label,
  name,
  options,
  value,
  onChange,
}: FormDropdownProps<Value>) {
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

  const selectValue = (nextValue: Value) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className={`form-dropdown ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
      <input name={name} type="hidden" value={value} />
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
        className="form-dropdown-trigger"
        disabled={disabled}
        id={id}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{selectedOption?.label ?? value}</span>
        <ChevronDown aria-hidden="true" size={17} />
      </button>

      {isOpen ? (
        <div aria-label={label} className="form-dropdown-menu" role="listbox">
          {options.map((option) => (
            <button
              aria-selected={value === option.value}
              className="form-dropdown-option"
              key={option.value}
              onClick={() => selectValue(option.value)}
              role="option"
              type="button"
            >
              <span>{option.label}</span>
              {value === option.value ? <Check aria-hidden="true" size={16} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('OPEN');
  const [assignedToId, setAssignedToId] = useState(currentUserId);
  const canChangeAssignee = isAdmin || task?.createdById === currentUserId;

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setPriority(task?.priority ?? 'MEDIUM');
      setStatus(task?.status ?? 'OPEN');
      setAssignedToId(task?.assignedToId ?? currentUserId);
    }
  }, [currentUserId, isOpen, task?.assignedToId, task?.id, task?.priority, task?.status]);

  if (!isOpen) {
    return null;
  }

  const assigneeOptions: Array<DropdownOption<string>> = users.length
    ? users.map((user) => ({ label: user.name, value: user.id }))
    : [{ label: 'Me', value: currentUserId }];

  if (
    task?.assignedTo &&
    !assigneeOptions.some((option) => option.value === task.assignedToId)
  ) {
    assigneeOptions.push({
      label: task.assignedTo.name,
      value: task.assignedToId,
    });
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
    const nextInput: TaskInput = {
      ...parsed.data,
      dueDate: new Date(parsed.data.dueDate).toISOString(),
      assignedToId: parsed.data.assignedToId || currentUserId,
    };

    if (task && !canChangeAssignee) {
      const { assignedToId: _assignedToId, ...inputWithoutAssignee } = nextInput;
      await onSubmit(inputWithoutAssignee);
      return;
    }

    await onSubmit(nextInput);
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
              <FormDropdown<TaskPriority>
                id="task-priority"
                label="Priority"
                name="priority"
                options={taskPriorities}
                value={priority}
                onChange={setPriority}
              />
            </div>

            <div className="field">
              <label htmlFor="task-status">Status</label>
              <FormDropdown<TaskStatus>
                id="task-status"
                label="Status"
                name="status"
                options={taskStatuses}
                value={status}
                onChange={setStatus}
              />
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
              <FormDropdown
                disabled={!canChangeAssignee}
                id="task-assignee"
                label="Assignee"
                name="assignedToId"
                options={assigneeOptions}
                value={assignedToId}
                onChange={setAssignedToId}
              />
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
