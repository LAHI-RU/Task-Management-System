import { useQuery } from '@tanstack/react-query';
import { CalendarClock, ListTodo, ShieldCheck, TimerReset } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { getStatusLabel } from '../tasks/taskOptions';
import { getTasks } from '../tasks/tasksApi';
import type { TaskStatus } from '../tasks/types';

const statusOrder: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'TESTING', 'DONE'];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));

export function DashboardPage() {
  const { user } = useAuth();
  const tasksQuery = useQuery({
    queryKey: ['tasks', 'dashboard'],
    queryFn: () => getTasks({ pageSize: 100 }),
  });

  const tasks = tasksQuery.data?.tasks ?? [];
  const counts = statusOrder.reduce<Record<TaskStatus, number>>(
    (accumulator, status) => ({
      ...accumulator,
      [status]: tasks.filter((task) => task.status === status).length,
    }),
    {
      OPEN: 0,
      IN_PROGRESS: 0,
      TESTING: 0,
      DONE: 0,
    },
  );
  const overdueCount = tasks.filter(
    (task) => task.status !== 'DONE' && new Date(task.dueDate) < new Date(),
  ).length;
  const upcomingTasks = tasks
    .filter((task) => task.status !== 'DONE')
    .slice()
    .sort((first, second) => new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime())
    .slice(0, 5);

  return (
    <>
      <section className="page-header">
        <div>
          <h2>Good to see you, {user?.name.split(' ')[0]}</h2>
          <p>
            {user?.role === 'ADMIN'
              ? 'You can monitor all tasks across the team.'
              : 'You can see tasks you created or tasks assigned to you.'}
          </p>
        </div>
        <Link className="primary-button" to="/app/tasks">
          <ListTodo size={17} />
          Open tasks
        </Link>
      </section>

      <section className="dashboard-grid" aria-label="Workspace summary">
        {statusOrder.map((status) => (
          <article className="stat-card" key={status}>
            <span>{getStatusLabel(status)}</span>
            <strong>{tasksQuery.isLoading ? '-' : counts[status]}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-lower-grid">
        <article className="work-panel">
          <div className="panel-title">
            <CalendarClock size={20} />
            <h3>Upcoming work</h3>
          </div>
          {upcomingTasks.length > 0 ? (
            <ul className="compact-task-list">
              {upcomingTasks.map((task) => (
                <li key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.assignedTo.name}</span>
                  </div>
                  <time>{formatDate(task.dueDate)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming active tasks yet.</p>
          )}
        </article>

        <article className="work-panel">
          <div className="panel-title">
            <ShieldCheck size={20} />
            <h3>Workspace access</h3>
          </div>
          <div className="auth-metrics" aria-label="Workspace access summary">
            <div>
              <ShieldCheck size={22} />
              <strong>{user?.role}</strong>
              <span>current role</span>
            </div>
            <div>
              <ListTodo size={22} />
              <strong>{tasksQuery.data?.meta.total ?? 0}</strong>
              <span>visible tasks</span>
            </div>
            <div>
              <TimerReset size={22} />
              <strong>{overdueCount}</strong>
              <span>overdue active</span>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
