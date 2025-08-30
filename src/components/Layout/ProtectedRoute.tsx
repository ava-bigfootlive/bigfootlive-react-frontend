import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '../Layout';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false
}: ProtectedRouteProps) {
  const { user, isInitialized, isLoading } = useAuth();
  const location = useLocation();

  // Wait for initialization to complete
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-white">Loading...</div>
        </div>
      </div>
    );
  }

  // If no user after initialization, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering protected content');

  // Check for admin access if required
  if (requireAdmin && user.role !== 'platform_admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Layout component uses Outlet internally, so just return it
  return <Layout />;
}