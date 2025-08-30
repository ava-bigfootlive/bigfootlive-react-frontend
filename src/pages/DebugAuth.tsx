import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cognitoService } from '@/lib/cognito';

export default function DebugAuth() {
  const { user, isInitialized, isLoading } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check what's in localStorage
        const lastUser = localStorage.getItem('CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.LastAuthUser');
        const idToken = localStorage.getItem(`CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.${lastUser}.idToken`);
        const accessToken = localStorage.getItem(`CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.${lastUser}.accessToken`);
        
        setSessionInfo({
          lastUser,
          hasIdToken: !!idToken,
          hasAccessToken: !!accessToken,
          currentUser: cognitoService.getCurrentUser()?.getUsername(),
          session: await cognitoService.getSession().catch(() => null)
        });
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();
    
    // Log every state change
    const log = `[${new Date().toISOString()}] isInit: ${isInitialized}, isLoading: ${isLoading}, user: ${user?.email || 'null'}`;
    setLogs(prev => [...prev, log]);
  }, [isInitialized, isLoading, user]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Current State</h2>
        <div>isInitialized: {String(isInitialized)}</div>
        <div>isLoading: {String(isLoading)}</div>
        <div>user: {user ? user.email : 'null'}</div>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Session Info</h2>
        <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">State Change Log</h2>
        {logs.map((log, i) => (
          <div key={i} className="text-xs font-mono">{log}</div>
        ))}
      </div>
    </div>
  );
}