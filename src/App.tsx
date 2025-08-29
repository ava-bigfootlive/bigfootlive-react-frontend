import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { errorHandler } from './utils/errorHandler';
import { networkMonitor } from './utils/networkMonitor';

// Existing Pages
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
import SAMLConfigurationPage from './pages/SAMLConfiguration';
import AdminDashboardPage from './pages/AdminDashboard';
import EventManagementPage from './pages/EventManagement';
import PlaylistManagerPage from './pages/PlaylistManager';
import EmbedGeneratorPage from './pages/EmbedGenerator';

// Streaming Pages
import WebRTCStreaming from './pages/streaming/WebRTCStreaming';
import RTMPConfiguration from './pages/streaming/RTMPConfiguration';
import HLSAdaptiveBitrate from './pages/streaming/HLSAdaptiveBitrate';
import StreamHealthMonitor from './pages/streaming/StreamHealthMonitor';

// Enhanced Dashboard Home Page
import StreamManager from './pages/Streaming/StreamManager';
import VODLibrary from './pages/CMS/VODLibrary';
import AssetManager from './pages/CMS/AssetManager';
import ContentScheduler from './pages/CMS/ContentScheduler';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
// Monetization components removed per user request
import EnhancedVideoPlayer from './components/VideoPlayer/EnhancedVideoPlayer';
import LiveChat from './components/Interactive/LiveChat';
import ReactionsOverlay from './components/Interactive/ReactionsOverlay';
import QASystem from './components/Interactive/QASystem';
import VirtualGifts from './components/Interactive/VirtualGifts';
import NotificationCenter from './pages/Notifications/NotificationCenter';
import MicrositesBuilder from './pages/Microsites/MicrositesBuilder';
import WhiteLabelConfig from './pages/WhiteLabel/WhiteLabelConfig';
import IntegrationsHub from './pages/Integrations/IntegrationsHub';
import UserManagement from './pages/Users/UserManagement';
import Settings from './pages/Settings/Settings';
import HelpCenter from './pages/Help/HelpCenter';

function App() {
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
      <ThemeProvider>
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
                <MediaAssetsPage />
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
          
          {/* Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* SAML Configuration */}
          <Route
            path="/saml-config"
            element={
              <ProtectedRoute requireAdmin={true}>
                <SAMLConfigurationPage />
              </ProtectedRoute>
            }
          />
          
          {/* Event Management */}
          <Route
            path="/event-management"
            element={
              <ProtectedRoute>
                <EventManagementPage />
              </ProtectedRoute>
            }
          />
          
          {/* Playlist Manager */}
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <PlaylistManagerPage />
              </ProtectedRoute>
            }
          />
          
          {/* Embed Generator */}
          <Route
            path="/embed-generator"
            element={
              <ProtectedRoute>
                <EmbedGeneratorPage />
              </ProtectedRoute>
            }
          />
          
          {/* Streaming Routes */}
          <Route
            path="/streaming/webrtc"
            element={
              <ProtectedRoute>
                <WebRTCStreaming />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/streaming/rtmp"
            element={
              <ProtectedRoute>
                <RTMPConfiguration />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/streaming/hls"
            element={
              <ProtectedRoute>
                <HLSAdaptiveBitrate />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/streaming/health"
            element={
              <ProtectedRoute>
                <StreamHealthMonitor />
              </ProtectedRoute>
            }
          />

          {/* Comprehensive Routes - New Platform Features */}

          <Route
            path="/stream-manager"
            element={
              <ProtectedRoute>
                <StreamManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vod-library"
            element={
              <ProtectedRoute>
                <VODLibrary />
              </ProtectedRoute>
            }
          />

          <Route
            path="/asset-manager"
            element={
              <ProtectedRoute>
                <AssetManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/content-scheduler"
            element={
              <ProtectedRoute>
                <ContentScheduler />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics-dashboard"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          {/* Monetization routes removed per user request */}

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationCenter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/microsites"
            element={
              <ProtectedRoute>
                <MicrositesBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/white-label"
            element={
              <ProtectedRoute>
                <WhiteLabelConfig />
              </ProtectedRoute>
            }
          />

          <Route
            path="/integrations"
            element={
              <ProtectedRoute>
                <IntegrationsHub />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpCenter />
              </ProtectedRoute>
            }
          />
          
          {/* 404 - Show not found page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
    </ThemeProvider>
  </ErrorBoundary>
  );
}

export default App;// Build timestamp: $(date)
