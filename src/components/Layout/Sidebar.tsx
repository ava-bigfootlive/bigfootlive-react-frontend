import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  Upload,
  Calendar,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  X,
  Shield,
  List,
  Code,
  Video,
  Radio,
  Tv,
  Mic,
  DollarSign,
  CreditCard,
  UserCheck,
  Lock,
  FolderOpen,
  TrendingUp,
  Layout,
  Bell,
  Zap,
  ShieldCheck,
  Terminal,
  Palette,
  Plug,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Wifi,
  PlayCircle,
  HelpCircle,
  Gift,
  Globe,
  Layers,
  Mail,
  Hash,
  Database,
  Cloud,
  Activity,
  Gamepad2,
  Vote,
  MessageCircleQuestion,
  HandMetal,
  Share2,
  Tags,
  TicketCheck,
  UserPlus,
  Key,
  FileSearch,
  Map,
  TestTube,
  Webhook,
  Sliders,
  Download,
  Sparkles,
  Cpu,
  AlertCircle,
  BookOpen,
  Command
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleItem = (item: string) => {
    setExpandedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/command', label: 'Command Palette', icon: Command, badge: 'Cmd+K' },
      ]
    },
    {
      title: 'Streaming',
      icon: Radio,
      items: [
        { 
          path: '/streaming/live', 
          label: 'Live Studio', 
          icon: Radio,
          subItems: [
            { path: '/streaming/webrtc', label: 'WebRTC Ultra-Low Latency', icon: Wifi },
            { path: '/streaming/rtmp', label: 'RTMP Configuration', icon: Activity },
            { path: '/streaming/hls', label: 'HLS Adaptive Bitrate', icon: Layers },
            { path: '/streaming/health', label: 'Stream Health Monitor', icon: Activity },
            { path: '/streaming/failover', label: 'Failover & Redundancy', icon: Shield },
            { path: '/streaming/cdn', label: 'CDN Edge Selection', icon: Globe },
            { path: '/streaming/recording', label: 'Recording Controls', icon: PlayCircle },
            { path: '/streaming/transcoding', label: 'Live Transcoding', icon: Cpu },
            { path: '/streaming/delay', label: 'Stream Delay Config', icon: Activity },
            { path: '/streaming/simulcast', label: 'Multi-Platform Simulcast', icon: Share2 },
          ]
        },
        {
          path: '/player',
          label: 'Video Player',
          icon: PlayCircle,
          subItems: [
            { path: '/player/custom', label: 'Custom HLS.js Player', icon: Video },
            { path: '/player/pip', label: 'Picture-in-Picture', icon: Tv },
            { path: '/player/controls', label: 'Playback Controls', icon: Sliders },
            { path: '/player/captions', label: 'Subtitles & Captions', icon: FileText },
            { path: '/player/chapters', label: 'Chapter Markers', icon: List },
            { path: '/player/thumbnails', label: 'Thumbnail Previews', icon: FolderOpen },
            { path: '/player/shortcuts', label: 'Keyboard Shortcuts', icon: Command },
            { path: '/player/cast', label: 'Chromecast/AirPlay', icon: Tv },
            { path: '/player/360', label: '360° Video Support', icon: Globe },
            { path: '/player/vr', label: 'VR Mode', icon: Smartphone },
          ]
        },
      ]
    },
    {
      title: 'Interactive',
      icon: MessageSquare,
      items: [
        { path: '/chat', label: 'Live Chat', icon: MessageSquare, badge: 'Real-time' },
        { path: '/reactions', label: 'Emoji Reactions', icon: Sparkles },
        { path: '/polls', label: 'Live Polls', icon: Vote },
        { path: '/qa', label: 'Q&A System', icon: MessageCircleQuestion },
        { path: '/gifts', label: 'Virtual Gifts & Tips', icon: Gift },
        { path: '/games', label: 'Audience Games', icon: Gamepad2 },
        { path: '/quiz', label: 'Live Quiz', icon: HelpCircle },
        { path: '/breakout', label: 'Breakout Rooms', icon: Users },
        { path: '/hand-raise', label: 'Raise Hand', icon: HandMetal },
        { path: '/screen-share', label: 'Screen Sharing', icon: Tv },
      ]
    },
    {
      title: 'Monetization',
      icon: DollarSign,
      items: [
        { path: '/subscriptions', label: 'Subscription Tiers', icon: CreditCard },
        { path: '/ppv', label: 'Pay-Per-View', icon: TicketCheck },
        { path: '/coupons', label: 'Coupons & Discounts', icon: Tags },
        { path: '/affiliate', label: 'Affiliate Program', icon: UserPlus },
        { path: '/revenue', label: 'Revenue Analytics', icon: TrendingUp },
        { path: '/payouts', label: 'Payout Configuration', icon: DollarSign },
        { path: '/tax', label: 'Tax Reporting', icon: FileText },
        { path: '/sponsors', label: 'Sponsorship Manager', icon: Shield },
        { path: '/ads', label: 'Ad Insertion', icon: Tv },
        { path: '/donations', label: 'Donation Settings', icon: Gift },
      ]
    },
    {
      title: 'Users & Access',
      icon: Users,
      items: [
        { path: '/users', label: 'User Management', icon: Users },
        { path: '/users/bulk', label: 'Bulk Import/Export', icon: Database },
        { path: '/users/fields', label: 'Custom Fields', icon: FileText },
        { path: '/users/verification', label: 'Email Verification', icon: Mail },
        { path: '/users/reset', label: 'Password Reset', icon: Key },
        { path: '/users/2fa', label: 'Two-Factor Auth', icon: Shield },
        { path: '/users/social', label: 'Social Login', icon: UserPlus },
        { path: '/users/activity', label: 'Activity Tracking', icon: Activity },
        { path: '/users/moderation', label: 'Ban & Suspension', icon: UserCheck },
        { path: '/users/ip-blocking', label: 'IP Blocking', icon: Lock },
        { path: '/users/gdpr', label: 'GDPR Tools', icon: Shield },
      ]
    },
    {
      title: 'Content',
      icon: FolderOpen,
      items: [
        { path: '/media-assets', label: 'Media Library', icon: FolderOpen },
        { path: '/vod-upload', label: 'Bulk Upload', icon: Upload },
        { path: '/transcription', label: 'Auto-Transcription', icon: Mic },
        { path: '/tags', label: 'Content Tagging', icon: Tags },
        { path: '/categories', label: 'Category Manager', icon: List },
        { path: '/featured', label: 'Featured Content', icon: Sparkles },
        { path: '/scheduling', label: 'Content Calendar', icon: Calendar },
        { path: '/versions', label: 'Version Control', icon: Database },
        { path: '/collaboration', label: 'Collaborative Edit', icon: Users },
        { path: '/approval', label: 'Approval Workflow', icon: UserCheck },
        { path: '/playlists', label: 'Playlist Manager', icon: List },
      ]
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      items: [
        { path: '/analytics', label: 'Real-time Dashboard', icon: BarChart3, badge: 'Live' },
        { path: '/analytics/reports', label: 'Report Builder', icon: FileText },
        { path: '/analytics/export', label: 'Export Data', icon: Download },
        { path: '/analytics/heatmaps', label: 'Engagement Heatmaps', icon: Map },
        { path: '/analytics/journey', label: 'Viewer Journey', icon: TrendingUp },
        { path: '/analytics/ab-testing', label: 'A/B Testing', icon: TestTube },
        { path: '/analytics/funnel', label: 'Conversion Funnel', icon: TrendingUp },
        { path: '/analytics/geo', label: 'Geographic Maps', icon: Globe },
        { path: '/analytics/devices', label: 'Device Analytics', icon: Smartphone },
        { path: '/analytics/api', label: 'API Monitoring', icon: Activity },
      ]
    },
    {
      title: 'Site Builder',
      icon: Layout,
      items: [
        { path: '/microsites', label: 'Microsite Builder', icon: Layout },
        { path: '/microsites/templates', label: 'Template Library', icon: Layers },
        { path: '/microsites/css', label: 'Custom CSS', icon: Code },
        { path: '/microsites/seo', label: 'SEO Tools', icon: FileSearch },
        { path: '/microsites/domains', label: 'Domain Mapping', icon: Globe },
        { path: '/microsites/ssl', label: 'SSL Certificates', icon: Lock },
        { path: '/microsites/ab', label: 'Landing Page A/B', icon: TestTube },
        { path: '/microsites/forms', label: 'Form Builder', icon: FileText },
        { path: '/microsites/capture', label: 'Email Capture', icon: Mail },
        { path: '/microsites/social', label: 'Social Integration', icon: Share2 },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { path: '/notifications/email', label: 'Email Templates', icon: Mail },
        { path: '/notifications/sms', label: 'SMS Alerts', icon: MessageSquare },
        { path: '/notifications/push', label: 'Push Notifications', icon: Bell },
        { path: '/notifications/center', label: 'Notification Center', icon: Bell, badge: '3' },
        { path: '/notifications/webhooks', label: 'Webhooks', icon: Webhook },
        { path: '/notifications/integrations', label: 'Slack/Discord', icon: Hash },
        { path: '/notifications/rules', label: 'Custom Rules', icon: Sliders },
        { path: '/notifications/reminders', label: 'Reminders', icon: Bell },
        { path: '/notifications/countdown', label: 'Event Timers', icon: Activity },
        { path: '/notifications/sequences', label: 'Follow-up Sequences', icon: List },
      ]
    },
    {
      title: 'Automation',
      icon: Zap,
      items: [
        { path: '/automation', label: 'Workflow Builder', icon: Zap },
        { path: '/automation/triggers', label: 'Trigger Config', icon: Activity },
        { path: '/automation/actions', label: 'Action Sequences', icon: List },
        { path: '/automation/logic', label: 'Conditional Logic', icon: Code },
        { path: '/automation/campaigns', label: 'Email Campaigns', icon: Mail },
        { path: '/automation/archive', label: 'Auto-Archive Rules', icon: FolderOpen },
        { path: '/automation/moderation', label: 'AI Moderation', icon: Shield },
        { path: '/automation/transcoding', label: 'Transcode Presets', icon: Cpu },
        { path: '/automation/backup', label: 'Backup Schedule', icon: Database },
        { path: '/automation/reports', label: 'Report Automation', icon: FileText },
      ]
    },
    {
      title: 'Security',
      icon: ShieldCheck,
      items: [
        { path: '/security/drm', label: 'DRM Protection', icon: Lock },
        { path: '/security/watermark', label: 'Watermarking', icon: Shield },
        { path: '/security/geo', label: 'Geo-Blocking', icon: Globe },
        { path: '/security/tokens', label: 'Token Auth', icon: Key },
        { path: '/security/rate-limit', label: 'Rate Limiting', icon: Activity },
        { path: '/security/cors', label: 'CORS Config', icon: Shield },
        { path: '/security/encryption', label: 'Content Encryption', icon: Lock },
        { path: '/security/streaming', label: 'Secure Streaming', icon: Shield },
        { path: '/security/audit', label: 'Audit Logs', icon: FileText },
        { path: '/security/alerts', label: 'Security Alerts', icon: AlertCircle },
      ]
    },
    {
      title: 'Developer',
      icon: Terminal,
      items: [
        { path: '/developer/api-keys', label: 'API Keys', icon: Key },
        { path: '/developer/webhook-debug', label: 'Webhook Debugger', icon: Webhook },
        { path: '/developer/api-docs', label: 'API Documentation', icon: BookOpen },
        { path: '/developer/sdk', label: 'SDK Downloads', icon: Download },
        { path: '/developer/examples', label: 'Code Examples', icon: Code },
        { path: '/developer/rate-limits', label: 'Rate Limit Monitor', icon: Activity },
        { path: '/developer/logs', label: 'Error Logs', icon: AlertCircle },
        { path: '/developer/profiler', label: 'Performance Profiler', icon: Activity },
        { path: '/developer/sandbox', label: 'Testing Sandbox', icon: TestTube },
        { path: '/developer/graphql', label: 'GraphQL Playground', icon: Code },
        { path: '/embed-generator', label: 'Embed Generator', icon: Code },
      ]
    },
    {
      title: 'White Label',
      icon: Palette,
      items: [
        { path: '/whitelabel/branding', label: 'Brand Customization', icon: Palette },
        { path: '/whitelabel/colors', label: 'Color Schemes', icon: Palette },
        { path: '/whitelabel/logo', label: 'Logo Settings', icon: Shield },
        { path: '/whitelabel/fonts', label: 'Font Selection', icon: FileText },
        { path: '/whitelabel/email', label: 'Email Templates', icon: Mail },
        { path: '/whitelabel/custom-code', label: 'Custom CSS/JS', icon: Code },
        { path: '/whitelabel/favicon', label: 'Favicon Config', icon: Shield },
        { path: '/whitelabel/meta', label: 'OG Meta Tags', icon: Tags },
        { path: '/whitelabel/pwa', label: 'PWA Settings', icon: Smartphone },
        { path: '/whitelabel/app-store', label: 'App Store Listings', icon: Smartphone },
      ]
    },
    {
      title: 'Integrations',
      icon: Plug,
      items: [
        { path: '/integrations/zoom', label: 'Zoom Integration', icon: Video },
        { path: '/integrations/calendar', label: 'Calendar Sync', icon: Calendar },
        { path: '/integrations/crm', label: 'CRM Connections', icon: Database },
        { path: '/integrations/payments', label: 'Payment Gateways', icon: CreditCard },
        { path: '/integrations/email', label: 'Email Services', icon: Mail },
        { path: '/integrations/analytics-tools', label: 'Analytics Tools', icon: BarChart3 },
        { path: '/integrations/storage', label: 'Cloud Storage', icon: Cloud },
        { path: '/integrations/cdn', label: 'CDN Providers', icon: Globe },
        { path: '/integrations/marketing', label: 'Marketing Tools', icon: TrendingUp },
        { path: '/integrations/support', label: 'Customer Support', icon: HelpCircle },
      ]
    },
    {
      title: 'Mobile',
      icon: Smartphone,
      items: [
        { path: '/mobile/pwa', label: 'Progressive Web App', icon: Smartphone },
        { path: '/mobile/touch', label: 'Touch Gestures', icon: HandMetal },
        { path: '/mobile/offline', label: 'Offline Viewing', icon: Download },
        { path: '/mobile/player', label: 'Mobile Player', icon: PlayCircle },
        { path: '/mobile/push', label: 'Push Notifications', icon: Bell },
        { path: '/mobile/navigation', label: 'App Navigation', icon: Layers },
        { path: '/mobile/download', label: 'Download Manager', icon: Download },
        { path: '/mobile/audio', label: 'Background Audio', icon: Mic },
        { path: '/mobile/streaming', label: 'Mobile Streaming', icon: Radio },
        { path: '/mobile/qr', label: 'QR Code Scanner', icon: Code },
      ]
    },
  ];

  // Admin-only sections
  const adminSections: NavSection[] = [
    {
      title: 'Administration',
      icon: Shield,
      items: [
        { path: '/admin-dashboard', label: 'Admin Dashboard', icon: BarChart3 },
        { path: '/platform-admin', label: 'Platform Settings', icon: Settings },
        { path: '/saml-config', label: 'SAML Config', icon: Shield },
        { path: '/event-management', label: 'Event Management', icon: Calendar },
        { path: '/docs', label: 'Documentation', icon: FileText },
      ]
    }
  ];

  const allSections = user?.role === 'platform_admin' 
    ? [...navSections, ...adminSections]
    : navSections;

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = location.pathname === item.path;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const Icon = item.icon;

    if (hasSubItems) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleItem(item.path)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
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
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.subItems.map(subItem => renderNavItem(subItem, depth + 1))}
            </div>
          )}
        </div>
      );
    }

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