import { CalendarClock, ListTodo, ShieldCheck } from 'lucide-react';

import { useAuth } from '../auth/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <section className="page-header">
        <div>
          <h2>Good to see you, {user?.name.split(' ')[0]}</h2>
          <p>
            This protected dashboard confirms frontend auth, session loading,
            and role-aware workspace routing are connected.
          </p>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Workspace summary">
        <article className="stat-card">
          <span>Role</span>
          <strong>{user?.role}</strong>
        </article>
        <article className="stat-card">
          <span>Open</span>
          <strong>0</strong>
        </article>
        <article className="stat-card">
          <span>In Progress</span>
          <strong>0</strong>
        </article>
        <article className="stat-card">
          <span>Done</span>
          <strong>0</strong>
        </article>
      </section>

      <section className="work-panel">
        <h3>Checkpoint 4 ready</h3>
        <p>
          Login, registration, protected routes, logout, and app shell are now
          available. Full task tables, filters, forms, and dashboard data come in
          the next checkpoint.
        </p>
        <div className="auth-metrics" aria-label="Implemented frontend features">
          <div>
            <ShieldCheck size={22} />
            <strong>Auth</strong>
            <span>cookie session</span>
          </div>
          <div>
            <ListTodo size={22} />
            <strong>Routes</strong>
            <span>protected shell</span>
          </div>
          <div>
            <CalendarClock size={22} />
            <strong>Next</strong>
            <span>task workflow</span>
          </div>
        </div>
      </section>
    </>
  );
}
