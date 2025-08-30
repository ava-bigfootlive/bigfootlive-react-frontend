import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Calendar,
  Video,
  BarChart3,
  Upload,
  Settings,
  Users,
  Radio,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: Home },
      { title: 'Events', href: '/events', icon: Calendar },
      { title: 'Go Live', href: '/streaming/live', icon: Radio },
    ]
  },
  {
    title: 'Content',
    items: [
      { title: 'Media Assets', href: '/media-assets', icon: Video },
      { title: 'Upload', href: '/vod-upload', icon: Upload },
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'Settings',
    items: [
      { title: 'Users', href: '/users', icon: Users },
      { title: 'Settings', href: '/settings', icon: Settings },
    ]
  }
];

export function AppSidebarSimple() {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(navigation.map(g => g.title));

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="app-sidebar">
      <div className="p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold">BigFootLive</h2>
          <p className="text-sm text-muted-foreground">Streaming Platform</p>
        </div>

        <nav className="space-y-6">
          {navigation.map((group) => {
            const isExpanded = expandedGroups.includes(group.title);
            
            return (
              <div key={group.title}>
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground mb-2"
                >
                  <span>{group.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-secondary text-secondary-foreground"
                              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}