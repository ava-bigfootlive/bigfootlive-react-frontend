import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoading, error, clearError, user, isInitialized } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Check if on main domain
  const hostname = window.location.hostname;
  const isMainDomain = hostname === 'bigfootlive.io' || hostname === 'www.bigfootlive.io';

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Redirect when user is authenticated
  useEffect(() => {
    if (user && !isLoading && isInitialized) {
      navigate(from, { replace: true });
    }
  }, [user, isLoading, isInitialized, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      // Navigation will happen via the useEffect above
    } catch (error) {
      // Error is handled by the AuthContext
      console.error('Login failed:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{
        background: 'hsl(var(--background))',
        backgroundImage: 'hsl(var(--brand-gradient))'
      }}
    >
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-display" style={{ color: 'hsl(var(--foreground))' }}>
            Sign in to BigfootLive
          </h2>
          <p className="text-subtitle mt-3">
            Enter your credentials to access your account
          </p>
        </div>

        <Card className="card-elevated mt-8 shadow-xl p-4 sm:p-6 lg:p-8 w-full max-w-md mx-auto" style={{
          backgroundColor: 'hsl(var(--surface))',
          borderColor: 'hsl(var(--border))'
        }}>
          <CardHeader className="text-center">
            <CardTitle className="text-title" style={{ color: 'hsl(var(--foreground))' }}>Welcome Back</CardTitle>
            <CardDescription className="text-subtitle">
              Sign in to your BigfootLive account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isMainDomain && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800">
                    You will be redirected to your tenant's domain after login.
                    Platform admins can access any domain.
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive" data-testid="error-message">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <label htmlFor="email" className="text-overline" style={{ color: 'hsl(var(--foreground-secondary))' }}>
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  data-testid="email-input"
                  className={cn(
                    "input-modern transition-all duration-200",
                    "focus:shadow-lg hover:shadow-md"
                  )}
                  style={{
                    backgroundColor: 'hsl(var(--input-background))',
                    borderColor: 'hsl(var(--input-border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="text-overline" style={{ color: 'hsl(var(--foreground-secondary))' }}>
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    data-testid="password-input"
                    className={cn(
                      "input-modern pr-10 transition-all duration-200",
                      "focus:shadow-lg hover:shadow-md"
                    )}
                    style={{
                      backgroundColor: 'hsl(var(--input-background))',
                      borderColor: 'hsl(var(--input-border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 rounded-full transition-all duration-200 hover:bg-[hsl(var(--surface-elevated))] active:scale-95"
                    style={{ color: 'hsl(var(--foreground-tertiary))' }}
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-caption font-medium transition-colors duration-200 hover:underline"
                    style={{ color: 'hsl(var(--brand-primary))' }}
                    data-testid="forgot-password-link"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className={cn(
                  "btn-primary w-full shadow-lg hover:shadow-xl transition-all duration-200",
                  "active:scale-95 font-medium"
                )}
                style={{
                  background: 'hsl(var(--button-primary))',
                  color: 'white'
                }}
                disabled={isLoading || !formData.email || !formData.password}
                data-testid="login-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-spinner" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-caption" style={{ color: 'hsl(var(--foreground-secondary))' }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium transition-colors duration-200 hover:underline"
                  style={{ color: 'hsl(var(--brand-primary))' }}
                  data-testid="signup-link"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}