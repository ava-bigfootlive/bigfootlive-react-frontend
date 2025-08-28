import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { errorHandler } from './utils/errorHandler';
import { networkMonitor } from './utils/networkMonitor';

// Pages
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ForgotPasswordPage from './pages/ForgotPassword';
import DashboardPage from './pages/DashboardEnhanced';
import VODUploadPage from './pages/VODUpload';
import StreamingLivePage from './pages/StreamingLive';
import PlatformAdminPage from './pages/PlatformAdmin';
import SelectTenantPage from './pages/SelectTenant';
import UnauthorizedPage from './pages/Unauthorized';
import UserManagementPage from './pages/UserManagement';
import NotFound from './pages/ErrorPages/NotFound';
import ServerError from './pages/ErrorPages/ServerError';
import Forbidden from './pages/ErrorPages/Forbidden';
import AnalyticsPage from './pages/AnalyticsSimple';
import ChatPage from './pages/Chat';
import DocumentationPage from './pages/Documentation';
import { EventsPage } from './pages/Events';
import LandingPage from './pages/Landing';
import MediaAssetsPage from './pages/MediaAssets';
import VideoPlayerTestPage from './pages/VideoPlayerTest';

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Setup global error handlers
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      errorHandler.handle(
        event.reason,
        'Unhandled Promise Rejection'
      );
      // Prevent default browser error handling
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      errorHandler.handle(
        event.error || new Error(event.message),
        'JavaScript Error'
      );
      // Prevent default browser error handling
      event.preventDefault();
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Network monitor listeners
    networkMonitor.on('statusChange', (event) => {
      console.log('Network status changed:', event);
    });

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      networkMonitor.removeAllListeners();
    };
  }, []);
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/403" element={<Forbidden />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/vod-upload"
            element={
              <ProtectedRoute>
                <VODUploadPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/streaming/live"
            element={
              <ProtectedRoute>
                <StreamingLivePage />
              </ProtectedRoute>
            }
          />
          
          {/* Alias for /streaming-live to match test expectations */}
          <Route
            path="/streaming-live"
            element={
              <ProtectedRoute>
                <StreamingLivePage />
              </ProtectedRoute>
            }
          />
          
          {/* Parent route for /streaming */}
          <Route
            path="/streaming"
            element={
              <ProtectedRoute>
                <StreamingLivePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/select-tenant"
            element={
              <ProtectedRoute>
                <SelectTenantPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/docs"
            element={
              <ProtectedRoute>
                <DocumentationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/media-assets"
            element={
              <ProtectedRoute>
                <MediaAssetsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/video-test"
            element={
              <ProtectedRoute>
                <VideoPlayerTestPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Platform Admin Route */}
          <Route
            path="/platform-admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <PlatformAdminPage />
              </ProtectedRoute>
            }
          />
          
          {/* 404 - Show not found page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  </ErrorBoundary>
  );
}

export default App;