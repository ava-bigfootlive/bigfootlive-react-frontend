import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '../ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="lg:ml-64 transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="card-modern sticky top-0 z-40 border-b" style={{
          backgroundColor: 'hsl(var(--surface))',
          borderColor: 'hsl(var(--border))'
        }}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className={cn(
                    "lg:hidden transition-colors duration-200",
                    "hover:bg-[hsl(var(--surface-overlay))] active:scale-95"
                  )}
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="animate-fade-in">
                  <h1 className="text-headline" style={{ color: 'hsl(var(--foreground))' }}>{title}</h1>
                  {subtitle && (
                    <p className="text-subtitle mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="animate-slide-in">
                  {actions}
                </div>
                <div className="flex items-center p-1 rounded-lg" style={{ backgroundColor: 'hsl(var(--surface-elevated))' }}>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 sm:p-6 lg:p-8 animate-fade-in" style={{
          backgroundColor: 'hsl(var(--background))',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}