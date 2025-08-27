import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signOut as amplifySignOut,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  AuthError
} from 'aws-amplify/auth';
import '../lib/amplify-config';

interface User {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  tenantId?: string;
  roles?: string[];
  role?: string;
}


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, attributes?: { given_name?: string; family_name?: string }) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      
      if (currentUser && session.tokens) {
        const userAttributes = session.tokens.idToken?.payload;
        const userGroups = userAttributes?.['cognito:groups'] as string[] || [];
        const userTenantId = userAttributes?.['custom:tenant_id'] as string;
        
        // Get current domain and tenant
        const hostname = window.location.hostname;
        const isPlatformAdmin = userGroups.includes('platform_admin');
        
        // Extract tenant from subdomain (e.g., acme.bigfootlive.io -> acme)
        const tenantFromDomain = hostname.split('.')[0];
        const isMainDomain = hostname === 'bigfootlive.io' || 
                            hostname === 'www.bigfootlive.io';
        const isCloudFront = hostname === 'd2dbuyze4zqbdy.cloudfront.net';
        const isLocalhost = hostname === 'localhost';
        
        // If user is on main domain and has a tenant (not platform admin), redirect to their tenant
        if (isMainDomain && userTenantId && !isPlatformAdmin) {
          // Set user first so they're authenticated when redirected
          setUser({
            id: currentUser.userId,
            email: userAttributes?.email as string || '',
            given_name: userAttributes?.given_name as string,
            family_name: userAttributes?.family_name as string,
            firstName: userAttributes?.given_name as string,
            lastName: userAttributes?.family_name as string,
            username: currentUser.username,
            tenantId: userTenantId,
            roles: (userAttributes?.['custom:roles'] as string)?.split(',') || [],
            role: 'user'
          });
          
          // Redirect to tenant subdomain - auth cookies should work across subdomains
          setTimeout(() => {
            const tenantUrl = `https://${userTenantId}.bigfootlive.io${window.location.pathname}`;
            window.location.replace(tenantUrl);
          }, 100);
          return;
        }
        
        // Validate tenant access for subdomain access
        if (!isMainDomain && !isCloudFront && !isLocalhost && !isPlatformAdmin) {
          // User is on a tenant subdomain - validate they belong to this tenant
          if (!userTenantId || userTenantId !== tenantFromDomain) {
            console.error(`Tenant mismatch: User tenant ${userTenantId} trying to access ${tenantFromDomain}`);
            await amplifySignOut();
            setUser(null);
            setError('You do not have access to this tenant');
            return;
          }
        }
        
        setUser({
          id: currentUser.userId,
          email: userAttributes?.email as string || '',
          given_name: userAttributes?.given_name as string,
          family_name: userAttributes?.family_name as string,
          firstName: userAttributes?.given_name as string,
          lastName: userAttributes?.family_name as string,
          username: currentUser.username,
          tenantId: userTenantId,
          roles: (userAttributes?.['custom:roles'] as string)?.split(',') || [],
          role: isPlatformAdmin ? 'platform_admin' : 'user'
        });
      }
    } catch (err) {
      // User is not authenticated
      console.log('No authenticated user');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { isSignedIn, nextStep } = await amplifySignIn({ 
        username: email, 
        password 
      });
      
      if (isSignedIn) {
        // Check tenant validation after sign in
        const session = await fetchAuthSession();
        const userAttributes = session.tokens?.idToken?.payload;
        const userTenantId = userAttributes?.['custom:tenant_id'] as string;
        const userGroups = userAttributes?.['cognito:groups'] as string[] || [];
        const isPlatformAdmin = userGroups.includes('platform_admin');
        
        // Get current domain and validate
        const hostname = window.location.hostname;
        const tenantFromDomain = hostname.split('.')[0];
        const isMainDomain = hostname === 'bigfootlive.io' || 
                            hostname === 'www.bigfootlive.io';
        const isCloudFront = hostname === 'd2dbuyze4zqbdy.cloudfront.net';
        const isLocalhost = hostname === 'localhost';
        
        // If user is on main domain and has a tenant, redirect to their tenant subdomain
        if (isMainDomain && userTenantId && !isPlatformAdmin) {
          // Don't call checkAuth here, just redirect
          // The cookies will be available on the subdomain
          const tenantUrl = `https://${userTenantId}.bigfootlive.io/dashboard`;
          window.location.replace(tenantUrl);
          return; // Don't navigate locally
        }
        
        // If on a tenant subdomain, validate they belong to that tenant
        if (!isMainDomain && !isCloudFront && !isLocalhost && !isPlatformAdmin) {
          if (!userTenantId || userTenantId !== tenantFromDomain) {
            await amplifySignOut();
            throw new Error(`Access denied. This account belongs to a different tenant.`);
          }
        }
        
        // Platform admins and localhost/CloudFront can proceed normally
        // If validation passes, complete the auth check
        await checkAuth();
        
        // Navigate to dashboard after successful auth
        navigate('/dashboard');
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        throw new Error('Please confirm your account before signing in');
      }
    } catch (err) {
      const errorMessage = err instanceof AuthError ? err.message : 
                          err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, attributes?: { given_name?: string; family_name?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { nextStep } = await amplifySignUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            given_name: attributes?.given_name,
            family_name: attributes?.family_name,
          }
        }
      });
      
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        // Store email for confirmation step
        localStorage.setItem('pendingSignUpEmail', email);
        navigate('/confirm-signup');
      }
    } catch (err) {
      const errorMessage = err instanceof AuthError ? err.message : 
                          err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { isSignUpComplete } = await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code
      });
      
      if (isSignUpComplete) {
        localStorage.removeItem('pendingSignUpEmail');
        navigate('/login');
      }
    } catch (err) {
      const errorMessage = err instanceof AuthError ? err.message : 
                          err instanceof Error ? err.message : 'Confirmation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await amplifySignOut();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const output = await amplifyResetPassword({ username: email });
      
      if (output.nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        localStorage.setItem('pendingResetEmail', email);
        navigate('/reset-password-confirm');
      }
    } catch (err) {
      const errorMessage = err instanceof AuthError ? err.message : 
                          err instanceof Error ? err.message : 'Reset request failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmResetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
      
      localStorage.removeItem('pendingResetEmail');
      navigate('/login');
    } catch (err) {
      const errorMessage = err instanceof AuthError ? err.message : 
                          err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch (err) {
      console.error('Failed to get access token:', err);
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isLoading,
        isInitialized,
        error,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
        resetPassword,
        confirmResetPassword,
        clearError,
        getAccessToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}