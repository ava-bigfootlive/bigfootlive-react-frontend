import { ReactNode, useEffect } from 'react';
import { AppSidebar } from './app-sidebar';
import { Header } from './header';
import { SearchDialog } from './search-dialog';
import { useLayout } from '@/context/layout-provider';
import { cn } from '@/lib/utils';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { sidebarCollapsed, mobileView, sidebarOpen, setSidebarOpen } = useLayout();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (mobileView) {
      // Close sidebar after navigation on mobile
      const handleRouteChange = () => {
        if (mobileView) {
          // Slight delay to allow navigation to complete
          setTimeout(() => {
            // setSidebarOpen(false); // Uncomment if you want auto-close on mobile
          }, 100);
        }
      };

      window.addEventListener('popstate', handleRouteChange);
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [mobileView]);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Overlay for mobile when sidebar is open */}
      {mobileView && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => {
            setSidebarOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <AppSidebar />

      {/* Main content area */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300',
          !mobileView && (sidebarCollapsed ? 'pl-16' : 'pl-64')
        )}
      >
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Dialog */}
      <SearchDialog />
    </div>
  );
}