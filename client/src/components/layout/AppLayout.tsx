import {
  CheckCircle2,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth';

const pageMeta: Record<string, { title: string; description: string }> = {
  '/app': {
    title: 'Dashboard',
    description: 'A protected workspace for task workflow and ownership.',
  },
  '/app/tasks': {
    title: 'Tasks',
    description: 'Create, assign, filter, update, and review task records.',
  },
};

export function AppLayout() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? pageMeta['/app'];

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-mark">
          <CheckCircle2 size={23} />
          <span>FlowBoard</span>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          <NavLink className="nav-link" end to="/app">
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink className="nav-link" to="/app/tasks">
            <ListTodo size={18} />
            Tasks
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
            <span className="role-pill">{user?.role}</span>
          </div>

          <button className="ghost-button" onClick={logoutUser} type="button">
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div>
            <h1>{meta.title}</h1>
            <p>{meta.description}</p>
          </div>
          <NavLink className="secondary-button" to="/app/tasks">
            <Plus size={17} />
            New task
          </NavLink>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
