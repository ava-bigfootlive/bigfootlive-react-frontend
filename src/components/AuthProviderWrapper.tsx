import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { navigationService } from '../services/navigationService';

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('AuthProviderWrapper: Setting up navigation service');
    navigationService.setNavigate(navigate);
  }, [navigate]);
  
  return <AuthProvider>{children}</AuthProvider>;
}