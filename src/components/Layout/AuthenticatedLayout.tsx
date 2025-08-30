import { ReactNode } from 'react';
import { AppSidebar } from '../layout/app-sidebar';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}