import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/components/Layout/ProtectedRoute';
import LoadingScreen from '@/components/LoadingScreen';

// Auth pages
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import ForgotPasswordPage from '@/pages/ForgotPassword';

// Main pages - lazy loaded
const Dashboard = lazy(() => import('@/pages/DashboardMinimal'));
const Events = lazy(() => import('@/pages/Events').then(m => ({ default: m.EventsPage })));
const StreamingLive = lazy(() => import('@/pages/StreamingLiveMinimal'));
const MediaAssets = lazy(() => import('@/pages/MediaAssets'));
const VODUpload = lazy(() => import('@/pages/VODUpload'));
const Analytics = lazy(() => import('@/pages/AnalyticsSimple'));
const Chat = lazy(() => import('@/pages/Chat'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const Settings = lazy(() => import('@/pages/Settings/Settings'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const PlatformAdmin = lazy(() => import('@/pages/PlatformAdmin'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/events" element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        } />
        
        <Route path="/streaming/live" element={
          <ProtectedRoute>
            <StreamingLive />
          </ProtectedRoute>
        } />
        
        <Route path="/media-assets" element={
          <ProtectedRoute>
            <MediaAssets />
          </ProtectedRoute>
        } />
        
        <Route path="/vod-upload" element={
          <ProtectedRoute>
            <VODUpload />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/platform-admin" element={
          <ProtectedRoute requireAdmin={true}>
            <PlatformAdmin />
          </ProtectedRoute>
        } />
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}