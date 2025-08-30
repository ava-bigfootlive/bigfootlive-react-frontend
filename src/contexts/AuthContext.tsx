import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cognitoService, type User } from '@/lib/cognito';

interface AuthContextType {
  user: User | null;
  tenant?: string;
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
  // Check if user exists in localStorage SYNCHRONOUSLY to prevent flicker
  const hasStoredSession = () => {
    const lastUser = localStorage.getItem(`CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.LastAuthUser`);
    return !!lastUser;
  };

  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(hasStoredSession()); // Only show loading if we have a stored session
  const [isInitialized, setIsInitialized] = useState(!hasStoredSession()); // If no session, we're already initialized
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only try to initialize if we have a stored session
    if (hasStoredSession()) {
      initializeAuth();
    }
  }, []);

  const initializeAuth = async () => {
    if (initializingRef.current) {
      console.log('Auth initialization already in progress, skipping');
      return;
    }
    
    console.log('Starting auth initialization...');
    initializingRef.current = true;
    setIsLoading(true);
    
    try {
      const userData = await cognitoService.getUserData();
      
      if (userData) {
        console.log('Auth initialization completed - user found:', userData.email);
        
        const hostname = window.location.hostname;
        const tenantFromDomain = hostname.split('.')[0];
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const currentTenant = userData.tenantId || (isLocalhost ? 'default' : tenantFromDomain);
        
        setUser(userData);
        setTenant(currentTenant);
      } else {
        console.log('Auth initialization completed - no user found');
        setUser(null);
        setTenant(undefined);
      }
    } catch (err) {
      console.log('Auth initialization - no active session');
      setUser(null);
      setTenant(undefined);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      initializingRef.current = false;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Starting sign-in process for:', email);
    setError(null);
    setIsLoading(true);
    
    try {
      const { session, user: userData } = await cognitoService.signIn(email, password);
      console.log('✅ Sign-in successful');
      
      if (userData) {
        const hostname = window.location.hostname;
        const tenantFromDomain = hostname.split('.')[0];
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const currentTenant = userData.tenantId || (isLocalhost ? 'default' : tenantFromDomain);
        
        console.log('👤 Setting user data:', userData.email);
        setUser(userData);
        setTenant(currentTenant);
        setIsInitialized(true);
      } else {
        throw new Error('Failed to get user data after sign-in');
      }
    } catch (err: any) {
      console.error('❌ Sign-in error:', err);
      const errorMessage = err.message || 'Sign in failed';
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
      const result = await cognitoService.signUp(email, password, attributes);
      console.log('Sign up successful:', result);
      
      // Store email for confirmation page
      localStorage.setItem('pendingSignUpEmail', email);
      navigate('/confirm-signup');
    } catch (err: any) {
      const errorMessage = err.message || 'Sign up failed';
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
      await cognitoService.confirmSignUp(email, code);
      localStorage.removeItem('pendingSignUpEmail');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.message || 'Confirmation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      cognitoService.signOut();
      setUser(null);
      setTenant(undefined);
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await cognitoService.resetPassword(email);
      localStorage.setItem('pendingResetEmail', email);
      navigate('/reset-password-confirm');
    } catch (err: any) {
      const errorMessage = err.message || 'Reset request failed';
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
      await cognitoService.confirmResetPassword(email, code, newPassword);
      localStorage.removeItem('pendingResetEmail');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.message || 'Password reset failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    return cognitoService.getAccessToken();
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        tenant,
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