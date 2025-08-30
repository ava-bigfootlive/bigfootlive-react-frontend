import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, Video, ArrowRight, Shield, Star, Sparkles } from 'lucide-react';
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

  // Redirect if already authenticated
  useEffect(() => {
    if (user && isInitialized) {
      navigate(from, { replace: true });
    }
  }, [user, isInitialized, navigate, from]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/20 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-pink-300/10 rounded-full blur-2xl animate-pulse-slow" />
      </div>
      
      {/* Theme Toggle - Fixed Top Right Position */}
      <div className="fixed top-6 right-6 z-50">
        <div className="glass rounded-full p-2">
          <ThemeToggle />
        </div>
      </div>
      
      {/* Container with proper max-width constraint */}
      <div className="w-full max-w-5xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Marketing Content */}
          <div className="hidden lg:block space-y-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Video className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold text-gradient">
                BigFootLive
              </h1>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Welcome to the
                <br />
                <span className="text-gradient">future of streaming</span>
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Join 50,000+ creators and 500+ enterprises who trust BigFootLive 
                for their mission-critical streaming needs.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'Enterprise-grade security & compliance' },
                  { icon: Star, text: '99.99% uptime SLA guarantee' },
                  { icon: Sparkles, text: 'Sub-second latency streaming' },
                ].map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 group-hover:scale-110 transition-transform duration-300">
                        <FeatureIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Right Side - Login Form */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <div className="relative">
                  <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold text-gradient">
                  BigFootLive
                </h1>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome back
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Sign in to access your streaming dashboard
              </p>
            </div>

            <Card className="card-luxury border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
              {/* Card Header with Gradient */}
              <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-6 border-b border-white/10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sign In
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                    Access your streaming control center
                  </CardDescription>
                </div>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {isMainDomain && (
                    <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800 rounded-xl">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-blue-700 dark:text-blue-300">
                        You will be redirected to your tenant's domain after login.
                        Platform admins can access any domain.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {error && (
                    <Alert variant="destructive" data-testid="error-message" className="rounded-xl animate-scale-in">
                      <AlertDescription className="font-medium">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3 group">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      placeholder="Enter your email address"
                      disabled={isLoading}
                      data-testid="email-input"
                      className={cn(
                        "h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700",
                        "bg-white dark:bg-gray-800 transition-all duration-300",
                        "focus:border-purple-500 dark:focus:border-purple-400",
                        "focus:bg-purple-50 dark:focus:bg-purple-950/20",
                        "hover:border-gray-300 dark:hover:border-gray-600",
                        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                        "focus-ring-enhanced"
                      )}
                    />
                  </div>

                  <div className="space-y-3 group">
                    <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                          "h-12 px-4 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-700",
                          "bg-white dark:bg-gray-800 transition-all duration-300",
                          "focus:border-purple-500 dark:focus:border-purple-400",
                          "focus:bg-purple-50 dark:focus:bg-purple-950/20",
                          "hover:border-gray-300 dark:hover:border-gray-600",
                          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                          "focus-ring-enhanced"
                        )}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 hover:underline"
                      data-testid="forgot-password-link"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className={cn(
                      "w-full h-12 rounded-xl font-semibold text-lg group",
                      "bg-gradient-to-r from-purple-600 to-blue-600",
                      "hover:from-purple-700 hover:to-blue-700",
                      "active:scale-98 transition-all duration-300",
                      "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                      "relative overflow-hidden"
                    )}
                    disabled={isLoading || !formData.email || !formData.password}
                    data-testid="login-button"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" data-testid="loading-spinner" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="pt-6 text-center border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 hover:underline"
                      data-testid="signup-link"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}