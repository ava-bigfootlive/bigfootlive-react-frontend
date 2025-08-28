import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  Upload,
  Video,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  X,
  Shield,
  List,
  Code,
  Radio,
  DollarSign,
  CreditCard,
  TrendingUp,
  FolderOpen,
  Layout,
  Bell,
  Zap,
  Palette,
  Plug,
  Activity,
  Wifi,
  Layers,
  PlayCircle,
  Database,
  TicketCheck,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subItems?: NavItem[];
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/events', label: 'Events', icon: Calendar },
      ]
    },
    {
      title: 'Streaming',
      icon: Radio,
      items: [
        { path: '/streaming/live', label: 'Go Live', icon: Radio },
        { path: '/streaming/webrtc', label: 'WebRTC Streaming', icon: Wifi },
        { path: '/streaming/rtmp', label: 'RTMP Configuration', icon: Activity },
        { path: '/streaming/hls', label: 'HLS Adaptive Bitrate', icon: Layers },
        { path: '/streaming/health', label: 'Stream Health Monitor', icon: Activity },
        { path: '/stream-manager', label: 'Stream Manager', icon: PlayCircle },
      ]
    },
    {
      title: 'Content',
      icon: FolderOpen,
      items: [
        { path: '/vod-library', label: 'VOD Library', icon: Video },
        { path: '/asset-manager', label: 'Asset Manager', icon: Database },
        { path: '/content-scheduler', label: 'Content Scheduler', icon: Calendar },
        { path: '/embed-generator', label: 'Embed Generator', icon: Code },
      ]
    },
    {
      title: 'Management',
      icon: Users,
      items: [
        { path: '/users', label: 'User Management', icon: Users },
        { path: '/user-management', label: 'Team Management', icon: Shield },
        { path: '/event-management', label: 'Event Management', icon: Zap },
      ]
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      items: [
        { path: '/analytics', label: 'Analytics Overview', icon: BarChart3 },
        { path: '/analytics-dashboard', label: 'Analytics Dashboard', icon: TrendingUp },
      ]
    },
    {
      title: 'Platform',
      icon: Settings,
      items: [
        { path: '/chat', label: 'Chat', icon: MessageSquare },
        { path: '/settings', label: 'Settings', icon: Settings },
        { path: '/integrations', label: 'Integrations', icon: Plug },
        { path: '/white-label', label: 'White Label', icon: Palette },
        { path: '/microsites', label: 'Microsites', icon: Layout },
        { path: '/notifications', label: 'Notifications', icon: Bell },
        { path: '/help', label: 'Help Center', icon: HelpCircle },
        { path: '/docs', label: 'Documentation', icon: FileText },
      ]
    },
  ];

  // Admin-only sections
  const adminSections: NavSection[] = [
    {
      title: 'Admin',
      icon: Shield,
      items: [
        { path: '/platform-admin', label: 'Platform Admin', icon: Shield },
        { path: '/admin-dashboard', label: 'Admin Dashboard', icon: Shield },
        { path: '/saml-config', label: 'SAML Config', icon: Shield },
      ]
    }
  ];

  const isAdmin = user?.['custom:role'] === 'admin' || user?.['custom:role'] === 'superadmin';
  const allSections = isAdmin ? [...navSections, ...adminSections] : navSections;

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </div>
        {item.badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-50 w-72 transform bg-card border-r border-border transition-transform duration-200 ease-in-out',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0 lg:fixed'
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">BigfootLive</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {allSections.map((section) => {
              const isExpanded = expandedSections.includes(section.title.toLowerCase());
              const SectionIcon = section.icon;

              return (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(section.title.toLowerCase())}
                    className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {SectionIcon && <SectionIcon className="h-3 w-3" />}
                      <span>{section.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 space-y-1">
                      {section.items.map(item => renderNavItem(item))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {user?.given_name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}