import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * Route guard that redirects authenticated users to landing page
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
