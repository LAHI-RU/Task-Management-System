import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TasksPage } from './features/tasks/TasksPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/app" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
