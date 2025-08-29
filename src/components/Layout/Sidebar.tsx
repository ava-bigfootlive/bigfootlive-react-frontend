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
  Home,
  Users,
  Upload,
  PlayCircle,
  Wifi,
  Monitor,
  Globe,
  MessageSquare,
  ChevronDown,
  Film,
  FileText,
  Palette,
  Bell,
  HelpCircle
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
  badge?: string;
}

interface NavSection {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  collapsible?: boolean;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['streaming', 'content']);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Organized navigation with all features but minimalist presentation
  const navSections: NavSection[] = [
    {
      id: 'main',
      title: 'Main',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/events', label: 'Events', icon: Calendar },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      ]
    },
    {
      id: 'streaming',
      title: 'Streaming',
      icon: Radio,
      collapsible: true,
      items: [
        { path: '/streaming/live', label: 'Go Live', icon: Radio, badge: 'Quick' },
        { path: '/streaming/webrtc', label: 'WebRTC', icon: Monitor },
        { path: '/streaming/rtmp', label: 'RTMP Setup', icon: Wifi },
        { path: '/streaming/hls', label: 'HLS Config', icon: PlayCircle },
        { path: '/streaming/health', label: 'Health Monitor', icon: Monitor },
      ]
    },
    {
      id: 'content',
      title: 'Content',
      icon: Film,
      collapsible: true,
      items: [
        { path: '/vod-library', label: 'VOD Library', icon: Video },
        { path: '/media-assets', label: 'Media Assets', icon: Library },
        { path: '/playlists', label: 'Playlists', icon: FileText },
        { path: '/asset-manager', label: 'Asset Manager', icon: Upload },
        { path: '/content-scheduler', label: 'Scheduler', icon: Calendar },
      ]
    },
    {
      id: 'engagement',
      title: 'Engagement',
      icon: MessageSquare,
      collapsible: true,
      items: [
        { path: '/chat', label: 'Live Chat', icon: MessageSquare },
        { path: '/polls', label: 'Polls & Q&A', icon: Users },
        { path: '/reactions', label: 'Reactions', icon: PlayCircle },
      ]
    },
    {
      id: 'platform',
      title: 'Platform',
      icon: Globe,
      collapsible: true,
      items: [
        { path: '/white-label', label: 'White Label', icon: Palette },
        { path: '/microsites', label: 'Microsites', icon: Globe },
        { path: '/integrations', label: 'Integrations', icon: Globe },
        { path: '/embed-generator', label: 'Embed', icon: FileText },
      ]
    }
  ];

  // Add management section for admins
  const isAdmin = user?.['custom:role'] === 'admin' || user?.['custom:role'] === 'superadmin';
  if (isAdmin) {
    navSections.push({
      id: 'admin',
      title: 'Admin',
      icon: Shield,
      collapsible: true,
      items: [
        { path: '/admin-dashboard', label: 'Admin Dashboard', icon: Shield },
        { path: '/users', label: 'User Management', icon: Users },
        { path: '/platform-admin', label: 'Platform Admin', icon: Settings },
        { path: '/saml-config', label: 'SAML Config', icon: Shield },
      ]
    });
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-out',
        'dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0'
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-gray-100 dark:border-gray-900">
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                <Radio className="h-4 w-4 text-white dark:text-black" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                BigfootLive
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
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-900">
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

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto">
            <div className="space-y-1">
              {navSections.map((section) => {
                const isExpanded = !section.collapsible || expandedSections.includes(section.id);
                const SectionIcon = section.icon;
                
                return (
                  <div key={section.id}>
                    {section.collapsible ? (
                      <>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg",
                            "text-sm font-medium text-gray-600 dark:text-gray-400",
                            "hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {SectionIcon && <SectionIcon className="h-4 w-4" />}
                            <span>{section.title}</span>
                          </div>
                          <ChevronDown className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            isExpanded ? "transform rotate-180" : ""
                          )} />
                        </button>
                        {isExpanded && (
                          <div className="mt-1 space-y-0.5 pl-6">
                            {section.items.map((item) => {
                              const isActive = isPathActive(item.path);
                              const Icon = item.icon;
                              
                              return (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  className={cn(
                                    "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-200",
                                    isActive
                                      ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                  )}
                                >
                                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="text-sm">{item.label}</span>
                                  {item.badge && (
                                    <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                                      {item.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      section.items.map((item) => {
                        const isActive = isPathActive(item.path);
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
                      })
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Links */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-1">
              <Link
                to="/settings"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200",
                  isPathActive('/settings')
                    ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
              <Link
                to="/notifications"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200",
                  isPathActive('/notifications')
                    ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
              >
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Notifications</span>
              </Link>
              <Link
                to="/help"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200",
                  isPathActive('/help')
                    ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
              >
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Help</span>
              </Link>
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-100 dark:border-gray-900 p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.given_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.['custom:role'] || 'Member'}
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