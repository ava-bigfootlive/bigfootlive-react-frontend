import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';

// Pages
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ForgotPasswordPage from './pages/ForgotPassword';
import DashboardPage from './pages/Dashboard';
import StreamingPage from './pages/Streaming';
import StreamingLivePage from './pages/StreamingLive';
import PlatformAdminPage from './pages/PlatformAdmin';
import SelectTenantPage from './pages/SelectTenant';
import UnauthorizedPage from './pages/Unauthorized';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
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
            path="/streaming"
            element={
              <ProtectedRoute>
                <StreamingPage />
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
          
          <Route
            path="/select-tenant"
            element={
              <ProtectedRoute>
                <SelectTenantPage />
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
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;