import {
  CheckCircle2,
  LayoutDashboard,
  ListTodo,
  LogOut,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth';

const pageTitles: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/tasks': 'Tasks',
};

export function AppLayout() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? pageTitles['/app'];

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="brand-icon" aria-hidden="true">
            <CheckCircle2 size={20} strokeWidth={2.6} />
          </span>
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
          </div>

          <button className="ghost-button" onClick={logoutUser} type="button">
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <h1>{pageTitle}</h1>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
