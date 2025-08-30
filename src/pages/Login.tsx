import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user, isInitialized, signIn, error, isLoading, clearError } = useAuth();

  // Handle successful authentication - redirect to dashboard when user state becomes available
  useEffect(() => {
    if (user && isInitialized) {
      console.log('Login page: User authenticated', {
        user,
        tenantId: user.tenantId,
        currentHostname: window.location.hostname,
        redirectingTo: '/dashboard'
      });
      
      // Check if user has a tenant_id that would require redirect
      if (user.tenantId && user.tenantId !== 'default') {
        const currentHost = window.location.hostname;
        const expectedHost = `${user.tenantId}.bigfootlive.io`;
        
        // Only redirect if we're not already on the correct subdomain
        if (currentHost !== expectedHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
          console.log(`Redirecting to tenant subdomain: ${expectedHost}`);
          // Comment out the redirect for now to debug
          // window.location.href = `https://${expectedHost}/dashboard`;
          // return;
        }
      }
      
      navigate('/dashboard', { replace: true });
    }
  }, [user, isInitialized, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      await signIn(email, password);
      // Navigation will be handled by useEffect when user state changes
    } catch (error) {
      // Error is already set in context
      console.error('Login error:', error);
    }
  };

  // Show nothing while checking auth
  if (!isInitialized) {
    return null;
  }

  // Don't show login form if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) clearError();
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="space-y-4 flex-col">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm space-y-2">
              <Link 
                to="/reset-password" 
                className="text-primary hover:underline"
              >
                Forgot your password?
              </Link>
              <div>
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}