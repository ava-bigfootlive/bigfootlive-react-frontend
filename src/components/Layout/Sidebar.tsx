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
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
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

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Hyper-minimal navigation - only essentials
  const primaryNav: NavItem[] = [
    { 
      path: '/dashboard', 
      label: 'Home', 
      icon: Home
    },
    { 
      path: '/streaming/live', 
      label: 'Stream', 
      icon: Radio
    },
    { 
      path: '/events', 
      label: 'Events', 
      icon: Calendar
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      icon: BarChart3
    },
  ];

  // Secondary navigation items
  const secondaryNav: NavItem[] = [
    { 
      path: '/vod-library', 
      label: 'Library', 
      icon: Library
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: Settings
    },
  ];

  // Add admin link if user is admin
  const isAdmin = user?.['custom:role'] === 'admin' || user?.['custom:role'] === 'superadmin';
  if (isAdmin) {
    secondaryNav.push({
      path: '/admin-dashboard',
      label: 'Admin',
      icon: Shield
    });
  }

  return (
    <>
      {/* Mobile backdrop with blur */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hyper-Minimalist Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-out',
        'dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0'
      )}>
        <div className="flex h-full flex-col">
          {/* Minimal Header */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-gray-100 dark:border-gray-900">
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                <Radio className="h-4 w-4 text-white dark:text-black" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                BigFoot
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden -mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Action */}
          <div className="px-4 py-4">
            <Link
              to="/streaming/live"
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2.5",
                "bg-black dark:bg-white text-white dark:text-black",
                "hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-200",
                "font-medium text-sm"
              )}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Go Live</span>
            </Link>
          </div>

          {/* Minimal Navigation */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            {/* Primary Navigation */}
            <div className="space-y-1">
              {primaryNav.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200",
                      isActive
                        ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-gray-200 dark:bg-gray-800" />

            {/* Secondary Navigation */}
            <div className="space-y-1">
              {secondaryNav.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200",
                      isActive
                        ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Minimal User Section */}
          <div className="border-t border-gray-100 dark:border-gray-900 p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.given_name || user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 -mr-2"
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