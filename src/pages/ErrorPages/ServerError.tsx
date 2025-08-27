import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerCrash, RefreshCw, Home, AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

const ServerError = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    setIsChecking(true);
    try {
      await apiClient.healthCheck();
      setServerStatus('online');
      toast({
        title: 'Server is back online',
        description: 'You can now continue using the application',
        variant: 'default'
      });
    } catch (error) {
      setServerStatus('offline');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <ServerCrash className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl">500 - Server Error</CardTitle>
          <CardDescription className="text-lg mt-2">
            Something went wrong on our end. We're working to fix it.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Server status */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-sm">Server Status:</span>
              </div>
              <div className="flex items-center space-x-2">
                {serverStatus === 'checking' && (
                  <>
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">Checking...</span>
                  </>
                )}
                {serverStatus === 'online' && (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                  </>
                )}
                {serverStatus === 'offline' && (
                  <>
                    <div className="h-2 w-2 bg-red-500 rounded-full" />
                    <span className="text-sm text-red-600 dark:text-red-400">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* What happened */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">What happened?</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The server encountered an unexpected error while processing your request</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>This is a temporary issue and our team has been notified</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your data is safe and no information has been lost</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleRetry}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            <Button
              onClick={checkServerStatus}
              variant="outline"
              disabled={isChecking}
              className="flex items-center gap-2"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Check Status
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          {/* Additional info */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Error Code: 500 | Request ID: {Math.random().toString(36).substr(2, 9)}</p>
            <p className="mt-1">Timestamp: {new Date().toISOString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerError;