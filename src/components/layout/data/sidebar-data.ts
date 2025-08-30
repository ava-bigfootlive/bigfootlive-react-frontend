import {
  Home,
  Calendar,
  Video,
  Radio,
  Wifi,
  Settings2,
  FileVideo,
  Film,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  Bell,
  Palette,
  Globe,
  Link,
  PlaySquare,
  ListVideo,
  Upload,
  Activity,
  Shield,
  Database,
  type LucideIcon
} from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: string | number;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const sidebarData: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: Home,
      },
      {
        title: 'Notifications',
        url: '/notifications',
        icon: Bell,
        badge: 3,
      },
    ],
  },
  {
    title: 'Events',
    items: [
      {
        title: 'All Events',
        url: '/events',
        icon: Calendar,
        items: [
          {
            title: 'Live Events',
            url: '/events?status=live',
            icon: Radio,
          },
          {
            title: 'Scheduled',
            url: '/events?status=scheduled',
            icon: Calendar,
          },
          {
            title: 'Past Events',
            url: '/events?status=past',
            icon: FileVideo,
          },
        ],
      },
      {
        title: 'Event Management',
        url: '/event-management',
        icon: Settings2,
      },
    ],
  },
  {
    title: 'Streaming',
    items: [
      {
        title: 'Go Live',
        url: '/streaming/live',
        icon: Radio,
      },
      {
        title: 'WebRTC Streaming',
        url: '/streaming/webrtc',
        icon: Wifi,
      },
      {
        title: 'RTMP Setup',
        url: '/streaming/rtmp',
        icon: Video,
      },
      {
        title: 'HLS Configuration',
        url: '/streaming/hls',
        icon: PlaySquare,
      },
      {
        title: 'Stream Health',
        url: '/streaming/health',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        title: 'VOD Library',
        url: '/vod-library',
        icon: Film,
      },
      {
        title: 'Media Assets',
        url: '/media-assets',
        icon: Database,
      },
      {
        title: 'Upload Media',
        url: '/vod-upload',
        icon: Upload,
      },
      {
        title: 'Playlists',
        url: '/playlists',
        icon: ListVideo,
      },
      {
        title: 'Content Scheduler',
        url: '/content-scheduler',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        title: 'Overview',
        url: '/analytics',
        icon: BarChart3,
      },
      {
        title: 'Advanced Analytics',
        url: '/analytics-dashboard',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Engagement',
    items: [
      {
        title: 'Live Chat',
        url: '/chat',
        icon: Users,
      },
      {
        title: 'Polls & Q&A',
        url: '/polls',
        icon: HelpCircle,
      },
      {
        title: 'Reactions',
        url: '/reactions',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Customization',
    items: [
      {
        title: 'White Label',
        url: '/white-label',
        icon: Palette,
      },
      {
        title: 'Microsites',
        url: '/microsites',
        icon: Globe,
      },
      {
        title: 'Embed Generator',
        url: '/embed-generator',
        icon: Link,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'User Management',
        url: '/user-management',
        icon: Users,
      },
      {
        title: 'Platform Admin',
        url: '/platform-admin',
        icon: Shield,
      },
      {
        title: 'Integrations',
        url: '/integrations',
        icon: Link,
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Documentation',
        url: '/docs',
        icon: FileVideo,
      },
      {
        title: 'Help Center',
        url: '/help',
        icon: HelpCircle,
      },
    ],
  },
];

// Helper function to find active item
export function findActiveItem(pathname: string, items: NavGroup[]): NavItem | null {
  for (const group of items) {
    for (const item of group.items) {
      if (item.url === pathname) {
        return item;
      }
      if (item.items) {
        for (const subItem of item.items) {
          if (subItem.url === pathname) {
            return subItem;
          }
        }
      }
    }
  }
  return null;
}

// Helper to get breadcrumbs
export function getBreadcrumbs(pathname: string): { title: string; url?: string }[] {
  const breadcrumbs: { title: string; url?: string }[] = [
    { title: 'Home', url: '/' }
  ];

  for (const group of sidebarData) {
    for (const item of group.items) {
      if (item.url === pathname) {
        breadcrumbs.push({ title: item.title });
        return breadcrumbs;
      }
      if (item.items) {
        for (const subItem of item.items) {
          if (subItem.url === pathname) {
            breadcrumbs.push({ title: item.title, url: item.url });
            breadcrumbs.push({ title: subItem.title });
            return breadcrumbs;
          }
        }
      }
    }
  }

  return breadcrumbs;
}