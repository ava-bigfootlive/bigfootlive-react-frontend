import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <ShieldOff className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-white text-2xl">Access Denied</CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              This area is restricted to authorized personnel only. 
              If you believe you should have access, please contact your administrator.
            </p>
            
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
              
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}