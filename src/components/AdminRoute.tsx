import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Route guard that restricts access to admin users only
 * - Redirects unauthenticated users to /login
 * - Redirects non-admin users to /editor
 * - Renders children for admin users
 */
export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/editor" replace />;
  }

  return <>{children}</>;
};
