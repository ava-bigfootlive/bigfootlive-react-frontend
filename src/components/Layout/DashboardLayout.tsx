import { ThemeToggle } from '../ThemeToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  // Simplified layout - no sidebar since we use the global AuthenticatedLayout sidebar
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{
        backgroundColor: 'hsl(var(--surface))',
        borderColor: 'hsl(var(--border))'
      }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="animate-fade-in">
              <h1 className="text-headline" style={{ color: 'hsl(var(--foreground))' }}>{title}</h1>
              {subtitle && (
                <p className="text-subtitle mt-1">
                  {subtitle}
                </p>
              )}
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
  );
}