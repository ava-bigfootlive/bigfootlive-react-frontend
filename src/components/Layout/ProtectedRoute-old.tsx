import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedLayout } from '../layout/authenticated-layout';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
  requireAdmin?: boolean;
  useLayout?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  useLayout = true 
}: ProtectedRouteProps) {
  const { user, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Don't show anything until auth is initialized
  if (!isInitialized) {
    return null;
  }

  // Once initialized, check if user exists
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (requireAdmin && user.role !== 'platform_admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // If no children provided, use Outlet for nested routes
  const content = children || <Outlet />;

  // Wrap with authenticated layout if needed
  if (useLayout) {
    return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
  }

  return <>{content}</>;
}