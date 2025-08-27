import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Home, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Forbidden = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleRequestAccess = () => {
    const subject = encodeURIComponent('Access Request');
    const body = encodeURIComponent(`
Hello,

I would like to request access to the following resource:
URL: ${window.location.href}
User: ${user?.email || 'Not logged in'}
Timestamp: ${new Date().toISOString()}

Please review my request and grant appropriate permissions.

Thank you.
    `);
    window.location.href = `mailto:support@bigfootlive.io?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <Shield className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-3xl">403 - Access Denied</CardTitle>
          <CardDescription className="text-lg mt-2">
            You don't have permission to access this resource.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User info */}
          {user && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-2">Current User:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Email: {user.email}</p>
                <p>Role: {user.role || 'User'}</p>
                {user.tenantId && <p>Tenant: {user.tenantId}</p>}
              </div>
            </div>
          )}

          {/* Why this happened */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Why am I seeing this?</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You may not have the required role or permissions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The resource might be restricted to specific users or groups</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your account may need additional verification</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">What can you do?</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="default"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
              
              <Button
                onClick={handleRequestAccess}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Request Access
              </Button>
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Contact info */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>If you believe this is an error, please contact your administrator</p>
            <p className="mt-1">Error Code: 403 | Forbidden</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forbidden;