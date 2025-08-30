import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AuthDebug() {
  const { user, isInitialized, isLoading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Auth Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
{JSON.stringify({
  user: user,
  isInitialized: isInitialized,
  isLoading: isLoading,
  location: {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash
  },
  timestamp: new Date().toISOString()
}, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            <Button onClick={() => navigate('/events')}>Go to Events</Button>
            <Button onClick={() => signOut()} variant="destructive">Sign Out</Button>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Local Storage</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
{JSON.stringify({
  cognitoUser: localStorage.getItem('CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.LastAuthUser'),
  allKeys: Object.keys(localStorage).filter(k => k.includes('Cognito'))
}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}