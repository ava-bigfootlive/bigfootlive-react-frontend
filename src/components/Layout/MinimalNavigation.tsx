import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import {
  Radio,
  Video,
  Settings,
  LogOut,
  X,
  BarChart3,
  Calendar,
  Library,
  User,
  Shield,
  ChevronRight,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinimalNavigationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function MinimalNavigation({ sidebarOpen, setSidebarOpen }: MinimalNavigationProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>('stream');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const navSections: NavSection[] = [
    {
      title: 'Stream',
      items: [
        { 
          path: '/streaming/live', 
          label: 'Go Live', 
          icon: Radio,
          description: 'Start broadcasting now'
        },
        { 
          path: '/events', 
          label: 'My Events', 
          icon: Calendar,
          description: 'Manage your scheduled streams'
        },
        { 
          path: '/analytics', 
          label: 'Analytics', 
          icon: BarChart3,
          description: 'View performance metrics'
        },
      ]
    },
    {
      title: 'Content',
      items: [
        { 
          path: '/vod-library', 
          label: 'Library', 
          icon: Library,
          description: 'Your recorded content'
        },
        { 
          path: '/content-scheduler', 
          label: 'Schedule', 
          icon: Calendar,
          description: 'Plan upcoming content'
        },
      ]
    },
    {
      title: 'Settings',
      items: [
        { 
          path: '/settings', 
          label: 'Account', 
          icon: User,
          description: 'Your profile settings'
        },
        { 
          path: '/platform-admin', 
          label: 'Platform', 
          icon: Settings,
          description: 'System configuration'
        },
      ]
    },
  ];

  // Add admin section if user is admin
  const isAdmin = user?.['custom:role'] === 'admin' || user?.['custom:role'] === 'superadmin';
  if (isAdmin) {
    navSections[2].items.push({
      path: '/admin-dashboard',
      label: 'Admin',
      icon: Shield,
      description: 'Admin controls'
    });
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-80 transform bg-white transition-transform duration-300 ease-out border-r border-gray-100',
        'dark:bg-gray-950 dark:border-gray-900',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0'
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center justify-between px-8 border-b border-gray-100 dark:border-gray-900">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Radio className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">BigFootLive</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-8 overflow-y-auto">
            {/* Quick Action - Go Live */}
            <div className="mb-2">
              <Link
                to="/streaming/live"
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5",
                  "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
                  "hover:from-blue-700 hover:to-blue-800 transition-all duration-200",
                  "shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30",
                  "font-medium"
                )}
              >
                <Radio className="h-5 w-5" />
                <span>Go Live Now</span>
              </Link>
            </div>

            {/* Main Navigation Sections */}
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.title.toLowerCase())}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2",
                    "text-xs font-semibold uppercase tracking-wider",
                    "text-gray-500 hover:text-gray-700",
                    "dark:text-gray-400 dark:hover:text-gray-200",
                    "transition-colors duration-150"
                  )}
                >
                  <span>{section.title}</span>
                  <ChevronRight 
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      expandedSection === section.title.toLowerCase() && "rotate-90"
                    )} 
                  />
                </button>
                
                {expandedSection === section.title.toLowerCase() && (
                  <div className="mt-2 space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "group flex items-start gap-3 rounded-lg px-3 py-3 transition-all duration-200",
                            isActive
                              ? "bg-gray-100 dark:bg-gray-900"
                              : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                          )}
                        >
                          <Icon className={cn(
                            "h-5 w-5 mt-0.5 flex-shrink-0 transition-colors duration-200",
                            isActive 
                              ? "text-blue-600 dark:text-blue-400" 
                              : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium transition-colors duration-200",
                              isActive
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"
                            )}>
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-100 dark:border-gray-900 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.given_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}