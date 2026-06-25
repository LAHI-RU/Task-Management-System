import { useIsFetching } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from './useAuth';

function LoadingScreen({ isOverlay = false }: { isOverlay?: boolean }) {
  return (
    <div
      className={`loading-screen ${isOverlay ? 'is-overlay' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="loading-spinner" aria-hidden="true" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const initialPageFetches = useIsFetching({
    predicate: (query) =>
      query.queryKey[0] !== 'auth' && query.state.status === 'pending',
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <>
      {children}
      {initialPageFetches > 0 ? <LoadingScreen isOverlay /> : null}
    </>
  );
}
