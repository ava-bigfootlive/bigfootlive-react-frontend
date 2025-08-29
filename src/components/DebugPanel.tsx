import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiHealth } from '@/services/apiHealth';
import { RefreshCw, Trash2, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function DebugPanel() {
  const [apiStatus, setApiStatus] = useState(apiHealth.getStatus());
  const { toast } = useToast();

  const refreshStatus = () => {
    setApiStatus(apiHealth.getStatus());
  };

  const resetApiHealth = () => {
    apiHealth.reset();
    setApiStatus(apiHealth.getStatus());
    toast({
      title: 'API Health Reset',
      description: 'API health cache has been cleared. All endpoints will be retried.',
    });
  };

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            API Health Debug
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshStatus}
              className="h-7 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetApiHealth}
              className="h-7 px-2"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Status:</strong> {apiStatus.available ? 'Available' : 'Limited'}
        </div>
        <div>
          <strong>Blocked Endpoints:</strong>
          <ul className="mt-1 space-y-1">
            {Object.entries(apiStatus.endpoints)
              .filter(([_, status]) => !status.available && status.errorCount >= 3)
              .map(([endpoint, status]) => (
                <li key={endpoint} className="text-red-600 dark:text-red-400">
                  {endpoint} (errors: {status.errorCount})
                </li>
              ))}
          </ul>
          {Object.keys(apiStatus.endpoints).filter(k => !apiStatus.endpoints[k].available).length === 0 && (
            <p className="text-gray-500">None</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}