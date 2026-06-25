import { CalendarClock, Edit3, Trash2, UserRound } from 'lucide-react';

import { getPriorityLabel, getStatusLabel } from './taskOptions';
import type { Task } from './types';

type TaskDetailPanelProps = {
  canDelete: boolean;
  task: Task | null;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));

export function TaskDetailPanel({
  canDelete,
  task,
  onDelete,
  onEdit,
}: TaskDetailPanelProps) {
  if (!task) {
    return (
      <aside className="task-detail empty-state">
        <h3>Select a task</h3>
        <p>Open a task from the table to review ownership, status, priority, and due date.</p>
      </aside>
    );
  }

  return (
    <aside className="task-detail">
      <div className="detail-header">
        <div>
          <span className={`status-badge status-${task.status.toLowerCase()}`}>
            {getStatusLabel(task.status)}
          </span>
          <h3>{task.title}</h3>
        </div>
        <div className="detail-actions">
          <button className="icon-button" onClick={() => onEdit(task)} type="button">
            <Edit3 size={17} />
          </button>
          <button
            aria-label="Delete task"
            className="icon-button danger"
            disabled={!canDelete}
            onClick={() => onDelete(task)}
            title={canDelete ? 'Delete task' : 'Only task creators or admins can delete'}
            type="button"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <p className="detail-description">{task.description}</p>

      <dl className="detail-list">
        <div>
          <dt>Priority</dt>
          <dd>
            <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
              {getPriorityLabel(task.priority)}
            </span>
          </dd>
        </div>
        <div>
          <dt>Due date</dt>
          <dd>
            <CalendarClock size={16} />
            {formatDate(task.dueDate)}
          </dd>
        </div>
        <div>
          <dt>Assigned to</dt>
          <dd>
            <UserRound size={16} />
            {task.assignedTo.name}
          </dd>
        </div>
        <div>
          <dt>Created by</dt>
          <dd>
            <UserRound size={16} />
            {task.createdBy.name}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
