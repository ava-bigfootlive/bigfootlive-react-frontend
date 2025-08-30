import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import StreamingLive from './pages/StreamingLive';
import MediaAssets from './pages/MediaAssets';
import VODUpload from './pages/VODUpload';
import Analytics from './pages/Analytics';
import Chat from './pages/Chat';
import Settings from './pages/Settings/Settings';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="streaming-live" element={<StreamingLive />} />
            <Route path="media-assets" element={<MediaAssets />} />
            <Route path="vod-upload" element={<VODUpload />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="chat" element={<Chat />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;