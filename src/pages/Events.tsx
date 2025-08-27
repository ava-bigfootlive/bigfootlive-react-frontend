import { useState, useMemo, useCallback } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Square,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Copy,
  Settings,
  Activity,
  Server,
  ArrowUpDown,
  ChevronDown,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  SlidersHorizontal,
  BarChart3,
  Zap,
  Palette,
  Shield,
  Globe,
  Lock,
  UserCheck,
  CreditCard,
  MapPin,
  FileImage,
  Type,
  Code2,
  Paintbrush,
  DollarSign,
  Ticket,
  MessageSquare,
  Users2,
  Clock3,
  ExternalLink,
  Image,
  Monitor,
  Smartphone,
  Mail,
  Link2,
  Share2,
  QrCode,
  Key,
  Crown,
  UserPlus,
  Building2,
  Star,
  TrendingUp,
  PercentCircle,
  Tag
} from 'lucide-react';

// Enhanced Event interface with comprehensive branding and access controls
export interface Event {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  type: 'live-stream' | 'sim-live' | 'rebroadcast' | 'webinar' | 'conference';
  status: 'draft' | 'scheduled' | 'live' | 'ended' | 'cancelled';
  containerStatus: 'pending' | 'provisioning' | 'running' | 'stopping' | 'stopped' | 'failed';
  startTime: string;
  endTime: string;
  duration: string;
  timezone: string;
  currentViewers: number;
  maxViewers: number;
  peakViewers: number;
  totalViews: number;
  engagement: {
    chatMessages: number;
    reactions: number;
    polls: number;
    qaQuestions: number;
  };
  container: {
    id?: string;
    cpu: number;
    memory: number;
    status: string;
    healthScore: number;
    uptime: string;
  };
  streaming: {
    rtmpKey?: string;
    hlsUrl?: string;
    bitrates: number[];
    resolution: string;
    fps: number;
  };
  interactives: {
    chat: boolean;
    polls: boolean;
    qa: boolean;
    reactions: boolean;
    toastMessages: boolean;
  };
  // Enhanced Access Control System
  access: {
    privacy: 'public' | 'unlisted' | 'private' | 'password';
    password?: string;
    registration: 'none' | 'optional' | 'required' | 'approval';
    restrictions: {
      geographic?: string[];
      timeWindow?: {
        start: Date;
        end: Date;
      };
      deviceLimit?: number;
      ipWhitelist?: string[];
      domainRestrictions?: string[];
    };
    ticketing: {
      type: 'free' | 'paid' | 'tiered';
      price?: number;
      tiers?: {
        name: string;
        price: number;
        features: string[];
        limit?: number;
      }[];
      promoCodes?: {
        code: string;
        discount: number;
        type: 'percentage' | 'fixed';
        expiresAt?: Date;
      }[];
    };
    features: {
      waitingRoom: boolean;
      lobby: boolean;
      vipAccess: boolean;
      breakoutRooms: boolean;
      recordingAccess: 'all' | 'registered' | 'vip' | 'none';
    };
  };
  // Enhanced Branding System
  branding: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      fontFamily: 'Inter' | 'Roboto' | 'Open Sans' | 'Lato' | 'Montserrat';
    };
    assets: {
      logoUrl?: string;
      bannerUrl?: string;
      watermarkUrl?: string;
      backgroundUrl?: string;
    };
    customCSS?: string;
    playerTheme: 'default' | 'minimal' | 'branded' | 'premium';
  };
  recording: {
    enabled: boolean;
    autoArchive: boolean;
    retentionDays: number;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    socialMedia: boolean;
    reminderMinutes: number[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Mock data with container architecture support
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Q1 Product Launch Event',
    description: 'Introducing our revolutionary new product line for 2024 with live demos and Q&A',
    category: 'Product Launch',
    tags: ['product', 'launch', 'demo', 'q4-2024'],
    type: 'live-stream',
    status: 'live',
    containerStatus: 'running',
    startTime: '2024-03-15T14:00:00Z',
    endTime: '2024-03-15T16:00:00Z',
    duration: '2h 0m',
    timezone: 'UTC',
    currentViewers: 234,
    maxViewers: 500,
    peakViewers: 298,
    totalViews: 1247,
    engagement: {
      chatMessages: 89,
      reactions: 156,
      polls: 3,
      qaQuestions: 12
    },
    container: {
      id: 'container-prod-1',
      cpu: 75,
      memory: 68,
      status: 'healthy',
      healthScore: 95,
      uptime: '1h 23m'
    },
    streaming: {
      rtmpKey: 'live_stream_key_1',
      hlsUrl: 'https://stream.bigfootlive.io/live/1/playlist.m3u8',
      bitrates: [1080, 720, 480, 360],
      resolution: '1920x1080',
      fps: 30
    },
    interactives: {
      chat: true,
      polls: true,
      qa: true,
      reactions: true,
      toastMessages: true
    },
    access: {
      privacy: 'public',
      registration: 'none',
      restrictions: {},
      ticketing: {
        type: 'free'
      },
      features: {
        waitingRoom: false,
        lobby: false,
        vipAccess: false,
        breakoutRooms: false,
        recordingAccess: 'all'
      }
    },
    branding: {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#f59e0b',
        fontFamily: 'Inter'
      },
      assets: {
        logoUrl: '/api/assets/logos/event-1-logo.png',
        bannerUrl: '/api/assets/banners/event-1-banner.jpg',
        watermarkUrl: '/api/assets/watermarks/event-1-watermark.png'
      },
      playerTheme: 'branded'
    },
    recording: {
      enabled: true,
      autoArchive: true,
      retentionDays: 365
    },
    notifications: {
      email: true,
      sms: false,
      socialMedia: true,
      reminderMinutes: [60, 15]
    },
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-15T13:45:00Z',
    createdBy: 'john.doe@company.com'
  },
  {
    id: '2',
    name: 'Team All-Hands Meeting',
    description: 'Monthly company-wide update, announcements, and team Q&A session',
    category: 'Internal',
    tags: ['team', 'all-hands', 'monthly', 'internal'],
    type: 'webinar',
    status: 'scheduled',
    containerStatus: 'pending',
    startTime: '2024-03-20T16:00:00Z',
    endTime: '2024-03-20T17:00:00Z',
    duration: '1h 0m',
    timezone: 'UTC',
    currentViewers: 0,
    maxViewers: 200,
    peakViewers: 0,
    totalViews: 0,
    engagement: {
      chatMessages: 0,
      reactions: 0,
      polls: 0,
      qaQuestions: 0
    },
    container: {
      cpu: 0,
      memory: 0,
      status: 'pending',
      healthScore: 0,
      uptime: '0m'
    },
    streaming: {
      bitrates: [720, 480, 360],
      resolution: '1280x720',
      fps: 30
    },
    interactives: {
      chat: true,
      polls: true,
      qa: true,
      reactions: false,
      toastMessages: false
    },
    access: {
      privacy: 'password',
      password: 'TEAM2024',
      registration: 'none',
      restrictions: {
        domainRestrictions: ['company.com']
      },
      ticketing: {
        type: 'free'
      },
      features: {
        waitingRoom: true,
        lobby: true,
        vipAccess: false,
        breakoutRooms: false,
        recordingAccess: 'registered'
      }
    },
    branding: {
      theme: {
        primaryColor: '#10b981',
        secondaryColor: '#059669',
        accentColor: '#34d399',
        fontFamily: 'Inter'
      },
      assets: {},
      playerTheme: 'minimal'
    },
    recording: {
      enabled: true,
      autoArchive: false,
      retentionDays: 90
    },
    notifications: {
      email: true,
      sms: false,
      socialMedia: false,
      reminderMinutes: [30, 10]
    },
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-15T11:20:00Z',
    createdBy: 'hr@company.com'
  },
  {
    id: '3',
    name: 'Advanced React Workshop',
    description: 'Deep dive into React patterns, hooks, and performance optimization techniques',
    category: 'Education',
    tags: ['react', 'workshop', 'advanced', 'development'],
    type: 'conference',
    status: 'ended',
    containerStatus: 'stopped',
    startTime: '2024-03-10T18:00:00Z',
    endTime: '2024-03-10T21:00:00Z',
    duration: '3h 0m',
    timezone: 'UTC',
    currentViewers: 0,
    maxViewers: 150,
    peakViewers: 142,
    totalViews: 456,
    engagement: {
      chatMessages: 234,
      reactions: 345,
      polls: 8,
      qaQuestions: 28
    },
    container: {
      id: 'container-workshop-3',
      cpu: 0,
      memory: 0,
      status: 'terminated',
      healthScore: 0,
      uptime: '3h 12m'
    },
    streaming: {
      rtmpKey: 'workshop_stream_3',
      hlsUrl: 'https://archive.bigfootlive.io/events/3/playlist.m3u8',
      bitrates: [1080, 720, 480],
      resolution: '1920x1080',
      fps: 30
    },
    interactives: {
      chat: true,
      polls: true,
      qa: true,
      reactions: true,
      toastMessages: true
    },
    access: {
      privacy: 'public',
      registration: 'required',
      restrictions: {},
      ticketing: {
        type: 'paid',
        price: 49.99,
        promoCodes: [{
          code: 'EARLY25',
          discount: 25,
          type: 'percentage',
          expiresAt: new Date('2024-03-05T00:00:00Z')
        }]
      },
      features: {
        waitingRoom: true,
        lobby: true,
        vipAccess: true,
        breakoutRooms: true,
        recordingAccess: 'registered'
      }
    },
    branding: {
      theme: {
        primaryColor: '#f59e0b',
        secondaryColor: '#d97706',
        accentColor: '#fbbf24',
        fontFamily: 'Roboto'
      },
      assets: {
        logoUrl: '/api/assets/logos/event-3-logo.png',
        bannerUrl: '/api/assets/banners/event-3-banner.jpg',
        watermarkUrl: '/api/assets/watermarks/event-3-watermark.png'
      },
      customCSS: '.event-title { font-weight: 600; }',
      playerTheme: 'premium'
    },
    recording: {
      enabled: true,
      autoArchive: true,
      retentionDays: 730
    },
    notifications: {
      email: true,
      sms: true,
      socialMedia: true,
      reminderMinutes: [1440, 60, 15]
    },
    createdAt: '2024-02-20T14:00:00Z',
    updatedAt: '2024-03-10T21:15:00Z',
    createdBy: 'education@company.com'
  }
];

export default function EventsPage() {
  const [events] = useState<Event[]>(mockEvents);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);
  
  // Modal states
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // Event form state
  const [eventForm, setEventForm] = useState<Partial<Event>>({
    name: '',
    description: '',
    category: '',
    tags: [],
    type: 'live-stream',
    access: { 
      privacy: 'public', 
      registration: 'none',
      restrictions: {},
      ticketing: { type: 'free' },
      features: {
        waitingRoom: false,
        lobby: false,
        vipAccess: false,
        breakoutRooms: false,
        recordingAccess: 'all'
      }
    },
    interactives: {
      chat: true,
      polls: false,
      qa: false,
      reactions: false,
      toastMessages: false
    },
    recording: {
      enabled: true,
      autoArchive: false,
      retentionDays: 90
    },
    notifications: {
      email: true,
      sms: false,
      socialMedia: false,
      reminderMinutes: [60, 15]
    }
  });

  // Status badge styling
  const getStatusBadge = useCallback((status: Event['status'], containerStatus?: Event['containerStatus']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-500 text-white', icon: <Edit className="h-3 w-3" /> },
      scheduled: { color: 'bg-blue-500 text-white', icon: <Clock className="h-3 w-3" /> },
      live: { color: 'bg-red-500 text-white animate-pulse', icon: <Play className="h-3 w-3" /> },
      ended: { color: 'bg-green-500 text-white', icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { color: 'bg-gray-400 text-white', icon: <X className="h-3 w-3" /> }
    };

    const containerConfig = {
      pending: { color: 'bg-yellow-400 text-black', icon: <Clock className="h-3 w-3" /> },
      provisioning: { color: 'bg-blue-400 text-white', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      running: { color: 'bg-green-500 text-white', icon: <Activity className="h-3 w-3" /> },
      stopping: { color: 'bg-orange-400 text-white', icon: <Square className="h-3 w-3" /> },
      stopped: { color: 'bg-gray-500 text-white', icon: <Square className="h-3 w-3" /> },
      failed: { color: 'bg-red-500 text-white', icon: <AlertCircle className="h-3 w-3" /> }
    };

    const statusStyle = statusConfig[status];
    const containerStyle = containerStatus ? containerConfig[containerStatus] : null;

    return (
      <div className="flex gap-2">
        <Badge className={statusStyle.color}>
          <span className="flex items-center gap-1">
            {statusStyle.icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </Badge>
        {containerStatus && (
          <Badge variant="outline" className={containerStyle?.color}>
            <span className="flex items-center gap-1">
              {containerStyle?.icon}
              Container: {containerStatus}
            </span>
          </Badge>
        )}
      </div>
    );
  }, []);

  // Table columns definition
  const columns = useMemo<ColumnDef<Event>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{event.name}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {event.category} • {event.type}
              </span>
              {event.branding.theme && (
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: event.branding.theme.primaryColor }}
                  title="Event Brand Color"
                />
              )}
              {event.access.privacy !== 'public' && (
                <Badge variant="outline" className="text-xs">
                  {event.access.privacy === 'private' ? <Lock className="h-3 w-3" /> :
                   event.access.privacy === 'password' ? <Key className="h-3 w-3" /> :
                   <UserCheck className="h-3 w-3" />}
                </Badge>
              )}
              {event.access.ticketing.type !== 'free' && (
                <Badge variant="outline" className="text-xs text-green-600">
                  <DollarSign className="h-3 w-3" />
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const event = row.original;
        return getStatusBadge(event.status, event.containerStatus);
      },
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const event = row.original;
        const startDate = new Date(event.startTime);
        return (
          <div className="flex flex-col">
            <span>{startDate.toLocaleDateString()}</span>
            <span className="text-sm text-muted-foreground">
              {startDate.toLocaleTimeString()} ({event.duration})
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "currentViewers",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Viewers
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex flex-col text-center">
            <span className="font-medium">
              {event.status === 'live' ? event.currentViewers : event.peakViewers}
            </span>
            <span className="text-sm text-muted-foreground">
              {event.status === 'live' ? 'Current' : 'Peak'} • {event.totalViews} total
            </span>
          </div>
        );
      },
    },
    {
      id: "branding-status",
      header: "Brand",
      cell: ({ row }) => {
        const event = row.original;
        const hasCustomBranding = event.branding?.theme || event.branding?.assets?.logoUrl;
        
        return (
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-75">
                <div 
                  className="w-4 h-4 rounded border" 
                  style={{ backgroundColor: event.branding?.theme?.primaryColor || '#3b82f6' }}
                  title={`Brand Color: ${event.branding?.theme?.primaryColor || '#3b82f6'}`}
                />
                <Badge variant={hasCustomBranding ? "default" : "outline"}>
                  {hasCustomBranding ? (
                    <><Palette className="h-3 w-3 mr-1" />Branded</>
                  ) : (
                    <>Default</>
                  )}
                </Badge>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="font-semibold">Branding Preview</span>
                </div>
                <div 
                  className="p-4 rounded-lg" 
                  style={{ 
                    backgroundColor: event.branding?.theme?.primaryColor || '#3b82f6',
                    color: 'white',
                    fontFamily: event.branding?.theme?.fontFamily || 'Inter'
                  }}
                >
                  <h4 className="font-bold">{event.name}</h4>
                  <p className="text-sm opacity-90 mt-1">{event.description.slice(0, 100)}...</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs font-medium">Primary</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: event.branding?.theme?.primaryColor || '#3b82f6' }}
                      />
                      <span className="text-xs">{event.branding?.theme?.primaryColor || '#3b82f6'}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Font</Label>
                    <p className="text-xs mt-1">{event.branding?.theme?.fontFamily || 'Inter'}</p>
                  </div>
                </div>
                {event.branding?.assets?.logoUrl && (
                  <div>
                    <Label className="text-xs font-medium">Assets</Label>
                    <p className="text-xs text-muted-foreground mt-1">Logo, banner, watermark configured</p>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-3 w-3 mr-2" />
                  Edit Branding
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      id: "access-type",
      header: "Access",
      cell: ({ row }) => {
        const event = row.original;
        const { privacy, ticketing, registration } = event.access;
        
        const getAccessIcon = () => {
          switch (privacy) {
            case 'public': return <Globe className="h-3 w-3" />;
            case 'unlisted': return <Link2 className="h-3 w-3" />;
            case 'private': return <Lock className="h-3 w-3" />;
            case 'password': return <Key className="h-3 w-3" />;
            default: return <Globe className="h-3 w-3" />;
          }
        };
        
        const getAccessColor = () => {
          switch (privacy) {
            case 'public': return 'bg-green-100 text-green-800';
            case 'unlisted': return 'bg-yellow-100 text-yellow-800';
            case 'private': return 'bg-red-100 text-red-800';
            case 'password': return 'bg-purple-100 text-purple-800';
            default: return 'bg-green-100 text-green-800';
          }
        };

        return (
          <Popover>
            <PopoverTrigger asChild>
              <div className="space-y-1 cursor-pointer hover:opacity-75">
                <Badge className={getAccessColor()}>
                  {getAccessIcon()}
                  <span className="ml-1 capitalize">{privacy}</span>
                </Badge>
                {ticketing.type !== 'free' && (
                  <Badge variant="outline" className="text-green-600">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {ticketing.type === 'paid' ? `$${ticketing.price}` : 'Tiered'}
                  </Badge>
                )}
                {registration !== 'none' && (
                  <Badge variant="secondary" className="text-xs">
                    <UserCheck className="h-3 w-3 mr-1" />
                    {registration}
                  </Badge>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-semibold">Access Summary</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Privacy</span>
                    <Badge className={getAccessColor()}>
                      {getAccessIcon()}
                      <span className="ml-1 capitalize">{privacy}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Registration</span>
                    <Badge variant="secondary">
                      <UserCheck className="h-3 w-3 mr-1" />
                      {registration === 'none' ? 'Not Required' : registration}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ticketing</span>
                    <Badge variant={ticketing.type === 'free' ? 'outline' : 'default'}>
                      {ticketing.type === 'free' ? (
                        'Free'
                      ) : (
                        <><DollarSign className="h-3 w-3 mr-1" />{ticketing.type === 'paid' ? `$${ticketing.price}` : 'Tiered'}</>
                      )}
                    </Badge>
                  </div>
                  
                  {event.access.features && Object.entries(event.access.features).some(([_, enabled]) => enabled) && (
                    <div>
                      <span className="text-sm font-medium">Features</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.access.features.waitingRoom && <Badge variant="outline" className="text-xs">Waiting Room</Badge>}
                        {event.access.features.lobby && <Badge variant="outline" className="text-xs">Lobby</Badge>}
                        {event.access.features.vipAccess && <Badge variant="outline" className="text-xs">VIP Access</Badge>}
                        {event.access.features.breakoutRooms && <Badge variant="outline" className="text-xs">Breakout Rooms</Badge>}
                      </div>
                    </div>
                  )}
                  
                  {event.access.restrictions && Object.keys(event.access.restrictions).length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-orange-600">Restrictions</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {event.access.restrictions.geographic && <p>Geographic: {event.access.restrictions.geographic.length} countries</p>}
                        {event.access.restrictions.domainRestrictions && <p>Domain: {event.access.restrictions.domainRestrictions.length} domains</p>}
                        {event.access.restrictions.deviceLimit && <p>Device limit: {event.access.restrictions.deviceLimit}</p>}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Shield className="h-3 w-3 mr-2" />
                    Edit Access
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Link2 className="h-3 w-3 mr-2" />
                    Get Links
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      accessorKey: "container.healthScore",
      header: "Container",
      cell: ({ row }) => {
        const event = row.original;
        const { container } = event;
        
        if (container.status === 'pending' || container.status === 'terminated') {
          return <Badge variant="outline">Not Running</Badge>;
        }

        const healthColor = container.healthScore > 80 ? 'text-green-500' : 
                           container.healthScore > 60 ? 'text-yellow-500' : 'text-red-500';

        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className={`font-medium ${healthColor}`}>
                {container.healthScore}%
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              CPU: {container.cpu}% • RAM: {container.memory}%
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const event = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedEvent(event);
                  setDialogMode('view');
                  setShowEventDialog(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedEvent(event);
                  setDialogMode('edit');
                  setEventForm(event);
                  setShowEventDialog(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Palette className="mr-2 h-4 w-4" />
                Brand Event
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                Access Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Preview Event
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {event.status === 'scheduled' && (
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
                  Start Event
                </DropdownMenuItem>
              )}
              {event.status === 'live' && (
                <DropdownMenuItem>
                  <Square className="mr-2 h-4 w-4" />
                  Stop Event
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Clone Event
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Event Page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Generate Links
              </DropdownMenuItem>
              <DropdownMenuItem>
                <QrCode className="mr-2 h-4 w-4" />
                QR Code
              </DropdownMenuItem>
              {event.containerStatus === 'running' && (
                <DropdownMenuItem>
                  <Activity className="mr-2 h-4 w-4" />
                  Container Logs
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [getStatusBadge]);

  const table = useReactTable({
    data: events,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    globalFilterFn: 'includesString',
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Enhanced statistics calculations
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const liveEvents = events.filter(e => e.status === 'live').length;
    const scheduledEvents = events.filter(e => e.status === 'scheduled').length;
    const totalViews = events.reduce((sum, e) => sum + e.totalViews, 0);
    const runningContainers = events.filter(e => e.containerStatus === 'running').length;
    const avgEngagement = events.length > 0 ? 
      events.reduce((sum, e) => sum + e.engagement.chatMessages + e.engagement.reactions, 0) / events.length : 0;
    
    // Enhanced stats for branding and revenue
    const brandedEvents = events.filter(e => 
      e.branding?.theme?.primaryColor || e.branding?.assets?.logoUrl
    ).length;
    const paidEvents = events.filter(e => e.access.ticketing.type !== 'free').length;
    const totalRevenue = events.reduce((sum, e) => {
      if (e.access.ticketing.type === 'paid' && e.access.ticketing.price) {
        return sum + (e.access.ticketing.price * e.totalViews * 0.1); // Simulate 10% conversion
      }
      return sum;
    }, 0);
    const brandingCompletion = totalEvents > 0 ? Math.round((brandedEvents / totalEvents) * 100) : 0;

    return {
      totalEvents,
      liveEvents,
      scheduledEvents,
      totalViews,
      runningContainers,
      avgEngagement: Math.round(avgEngagement),
      brandedEvents,
      paidEvents,
      totalRevenue,
      brandingCompletion
    };
  }, [events]);

  // Event creation/editing handlers
  const handleCreateEvent = () => {
    setDialogMode('create');
    setSelectedEvent(null);
    setEventForm({
      name: '',
      description: '',
      category: '',
      tags: [],
      type: 'live-stream',
      access: { 
        privacy: 'public', 
        registration: 'none',
        restrictions: {},
        ticketing: { type: 'free' },
        features: {
          waitingRoom: false,
          lobby: false,
          vipAccess: false,
          breakoutRooms: false,
          recordingAccess: 'all'
        }
      },
      interactives: {
        chat: true,
        polls: false,
        qa: false,
        reactions: false,
        toastMessages: false
      },
      recording: {
        enabled: true,
        autoArchive: false,
        retentionDays: 90
      },
      notifications: {
        email: true,
        sms: false,
        socialMedia: false,
        reminderMinutes: [60, 15]
      }
    });
    setShowEventDialog(true);
  };

  const handleSaveEvent = () => {
    // In real app, this would call API
    console.log('Saving event:', eventForm);
    setShowEventDialog(false);
  };

  // Bulk operations
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const bulkOperationsAvailable = selectedRows.length > 0;

  return (
    <DashboardLayout 
      title="Event Management" 
      subtitle="Comprehensive event streaming management with container orchestration"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      }
    >
      {/* Enhanced Statistics Overview */}
      <div className={`grid grid-cols-1 gap-4 mb-6 ${stats.paidEvents > 0 ? 'md:grid-cols-7' : 'md:grid-cols-6'}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Now</p>
                <p className="text-2xl font-bold text-red-500">{stats.liveEvents}</p>
              </div>
              <Video className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-blue-500">{stats.scheduledEvents}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-green-500">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Containers</p>
                <p className="text-2xl font-bold text-purple-500">{stats.runningContainers}</p>
              </div>
              <Server className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Branded Events</p>
                <p className="text-2xl font-bold text-orange-500">{stats.brandedEvents}</p>
                <p className="text-xs text-muted-foreground">{stats.brandingCompletion}% completion</p>
              </div>
              <Palette className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Revenue Stats */}
        {stats.paidEvents > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{stats.paidEvents} paid events</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Table Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all events..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="pl-8 max-w-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem>Live Events</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Scheduled</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Ended</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  View
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Enhanced Bulk Operations */}
          {bulkOperationsAvailable && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <Button size="sm" variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Start Selected
              </Button>
              <Button size="sm" variant="outline">
                <Square className="mr-2 h-4 w-4" />
                Stop Selected
              </Button>
              <Button size="sm" variant="outline">
                <Palette className="mr-2 h-4 w-4" />
                Apply Branding
              </Button>
              <Button size="sm" variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Access Settings
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
                setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation/Edit Modal */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' && 'Create New Event'}
              {dialogMode === 'edit' && 'Edit Event'}
              {dialogMode === 'view' && 'Event Details'}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === 'view' && selectedEvent ? (
            // View Mode - Event Details
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Event Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm">{selectedEvent.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm">{selectedEvent.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <Badge variant="outline">{selectedEvent.type}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      {getStatusBadge(selectedEvent.status, selectedEvent.containerStatus)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Container Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Health Score</Label>
                      <span className="text-sm font-medium">{selectedEvent.container.healthScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">CPU Usage</Label>
                      <span className="text-sm">{selectedEvent.container.cpu}%</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Memory Usage</Label>
                      <span className="text-sm">{selectedEvent.container.memory}%</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Uptime</Label>
                      <span className="text-sm">{selectedEvent.container.uptime}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Engagement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Current Viewers</Label>
                      <span className="text-sm font-medium">{selectedEvent.currentViewers}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Peak Viewers</Label>
                      <span className="text-sm">{selectedEvent.peakViewers}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Chat Messages</Label>
                      <span className="text-sm">{selectedEvent.engagement.chatMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Reactions</Label>
                      <span className="text-sm">{selectedEvent.engagement.reactions}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Interactive Features</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedEvent.interactives.chat && <Badge variant="secondary">Chat</Badge>}
                        {selectedEvent.interactives.polls && <Badge variant="secondary">Polls</Badge>}
                        {selectedEvent.interactives.qa && <Badge variant="secondary">Q&A</Badge>}
                        {selectedEvent.interactives.reactions && <Badge variant="secondary">Reactions</Badge>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Access Type</Label>
                      <Badge variant="outline">{selectedEvent.access.type}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Recording</Label>
                      <Badge variant={selectedEvent.recording.enabled ? "default" : "secondary"}>
                        {selectedEvent.recording.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Create/Edit Mode - Event Form
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="container">Container</TabsTrigger>
                  <TabsTrigger value="interactive">Interactive</TabsTrigger>
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                  <TabsTrigger value="access">Access</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Event Name *</Label>
                      <Input
                        id="name"
                        value={eventForm.name || ''}
                        onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                        placeholder="Enter event name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={eventForm.category}
                        onValueChange={(value) => setEventForm({...eventForm, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product-launch">Product Launch</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="webinar">Webinar</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={eventForm.description || ''}
                      onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      placeholder="Describe your event"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Event Type *</Label>
                    <Select
                      value={eventForm.type}
                      onValueChange={(value: Event['type']) => setEventForm({...eventForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live-stream">Live Stream</SelectItem>
                        <SelectItem value="sim-live">Sim-Live (VOD Replay)</SelectItem>
                        <SelectItem value="rebroadcast">Rebroadcast</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={eventForm.startTime ? new Date(eventForm.startTime).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={eventForm.endTime ? new Date(eventForm.endTime).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={eventForm.timezone} onValueChange={(value) => setEventForm({...eventForm, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="container" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cpu">CPU Allocation</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select CPU allocation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5 vCPU (Light)</SelectItem>
                          <SelectItem value="1">1 vCPU (Standard)</SelectItem>
                          <SelectItem value="2">2 vCPU (Heavy)</SelectItem>
                          <SelectItem value="4">4 vCPU (Premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="memory">Memory Allocation</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select memory allocation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 GB (Light)</SelectItem>
                          <SelectItem value="2">2 GB (Standard)</SelectItem>
                          <SelectItem value="4">4 GB (Heavy)</SelectItem>
                          <SelectItem value="8">8 GB (Premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="resolution">Streaming Resolution</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select resolution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1920x1080">1080p (HD)</SelectItem>
                          <SelectItem value="1280x720">720p</SelectItem>
                          <SelectItem value="854x480">480p</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fps">Frame Rate</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frame rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 FPS</SelectItem>
                          <SelectItem value="60">60 FPS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="interactive" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Chat</Label>
                        <p className="text-sm text-muted-foreground">Allow viewers to chat during the event</p>
                      </div>
                      <Switch
                        checked={eventForm.interactives?.chat || false}
                        onCheckedChange={(checked) => 
                          setEventForm({
                            ...eventForm,
                            interactives: {
                              chat: checked,
                              polls: eventForm.interactives?.polls || false,
                              qa: eventForm.interactives?.qa || false,
                              reactions: eventForm.interactives?.reactions || false,
                              toastMessages: eventForm.interactives?.toastMessages || false
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Polls</Label>
                        <p className="text-sm text-muted-foreground">Enable interactive polls and voting</p>
                      </div>
                      <Switch
                        checked={eventForm.interactives?.polls || false}
                        onCheckedChange={(checked) => 
                          setEventForm({
                            ...eventForm,
                            interactives: {
                              chat: eventForm.interactives?.chat || false,
                              polls: checked,
                              qa: eventForm.interactives?.qa || false,
                              reactions: eventForm.interactives?.reactions || false,
                              toastMessages: eventForm.interactives?.toastMessages || false
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Q&A</Label>
                        <p className="text-sm text-muted-foreground">Allow viewers to submit questions</p>
                      </div>
                      <Switch
                        checked={eventForm.interactives?.qa || false}
                        onCheckedChange={(checked) => 
                          setEventForm({
                            ...eventForm,
                            interactives: {
                              chat: eventForm.interactives?.chat || false,
                              polls: eventForm.interactives?.polls || false,
                              qa: checked,
                              reactions: eventForm.interactives?.reactions || false,
                              toastMessages: eventForm.interactives?.toastMessages || false
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reactions</Label>
                        <p className="text-sm text-muted-foreground">Enable emoji reactions and feedback</p>
                      </div>
                      <Switch
                        checked={eventForm.interactives?.reactions || false}
                        onCheckedChange={(checked) => 
                          setEventForm({
                            ...eventForm,
                            interactives: {
                              chat: eventForm.interactives?.chat || false,
                              polls: eventForm.interactives?.polls || false,
                              qa: eventForm.interactives?.qa || false,
                              reactions: checked,
                              toastMessages: eventForm.interactives?.toastMessages || false
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Toast Messages</Label>
                        <p className="text-sm text-muted-foreground">Send announcements and notifications</p>
                      </div>
                      <Switch
                        checked={eventForm.interactives?.toastMessages || false}
                        onCheckedChange={(checked) => 
                          setEventForm({
                            ...eventForm,
                            interactives: {
                              chat: eventForm.interactives?.chat || false,
                              polls: eventForm.interactives?.polls || false,
                              qa: eventForm.interactives?.qa || false,
                              reactions: eventForm.interactives?.reactions || false,
                              toastMessages: checked
                            }
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Enhanced Branding Tab */}
                <TabsContent value="branding" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Theme Colors */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Theme Colors
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Primary Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="color"
                              value={eventForm.branding?.theme?.primaryColor || '#3b82f6'}
                              onChange={(e) => setEventForm({
                                ...eventForm,
                                branding: {
                                  ...eventForm.branding,
                                  theme: {
                                    ...eventForm.branding?.theme,
                                    primaryColor: e.target.value,
                                    secondaryColor: eventForm.branding?.theme?.secondaryColor || '#1e40af',
                                    accentColor: eventForm.branding?.theme?.accentColor || '#f59e0b',
                                    fontFamily: eventForm.branding?.theme?.fontFamily || 'Inter'
                                  }
                                }
                              })}
                              className="w-20 h-10"
                            />
                            <Input
                              value={eventForm.branding?.theme?.primaryColor || '#3b82f6'}
                              placeholder="#3b82f6"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Secondary Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="color"
                              value={eventForm.branding?.theme?.secondaryColor || '#1e40af'}
                              onChange={(e) => setEventForm({
                                ...eventForm,
                                branding: {
                                  ...eventForm.branding,
                                  theme: {
                                    ...eventForm.branding?.theme,
                                    primaryColor: eventForm.branding?.theme?.primaryColor || '#3b82f6',
                                    secondaryColor: e.target.value,
                                    accentColor: eventForm.branding?.theme?.accentColor || '#f59e0b',
                                    fontFamily: eventForm.branding?.theme?.fontFamily || 'Inter'
                                  }
                                }
                              })}
                              className="w-20 h-10"
                            />
                            <Input
                              value={eventForm.branding?.theme?.secondaryColor || '#1e40af'}
                              placeholder="#1e40af"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Accent Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="color"
                              value={eventForm.branding?.theme?.accentColor || '#f59e0b'}
                              onChange={(e) => setEventForm({
                                ...eventForm,
                                branding: {
                                  ...eventForm.branding,
                                  theme: {
                                    ...eventForm.branding?.theme,
                                    primaryColor: eventForm.branding?.theme?.primaryColor || '#3b82f6',
                                    secondaryColor: eventForm.branding?.theme?.secondaryColor || '#1e40af',
                                    accentColor: e.target.value,
                                    fontFamily: eventForm.branding?.theme?.fontFamily || 'Inter'
                                  }
                                }
                              })}
                              className="w-20 h-10"
                            />
                            <Input
                              value={eventForm.branding?.theme?.accentColor || '#f59e0b'}
                              placeholder="#f59e0b"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Font Family</Label>
                          <Select
                            value={eventForm.branding?.theme?.fontFamily || 'Inter'}
                            onValueChange={(value: 'Inter' | 'Roboto' | 'Open Sans' | 'Lato' | 'Montserrat') =>
                              setEventForm({
                                ...eventForm,
                                branding: {
                                  ...eventForm.branding,
                                  theme: {
                                    ...eventForm.branding?.theme,
                                    primaryColor: eventForm.branding?.theme?.primaryColor || '#3b82f6',
                                    secondaryColor: eventForm.branding?.theme?.secondaryColor || '#1e40af',
                                    accentColor: eventForm.branding?.theme?.accentColor || '#f59e0b',
                                    fontFamily: value
                                  }
                                }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Open Sans">Open Sans</SelectItem>
                              <SelectItem value="Lato">Lato</SelectItem>
                              <SelectItem value="Montserrat">Montserrat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Brand Assets */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          Brand Assets
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Event Logo</Label>
                          <div className="mt-2 space-y-2">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Drag and drop logo or click to browse</p>
                              <Button variant="outline" size="sm" className="mt-2">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Logo
                              </Button>
                            </div>
                            <Input
                              placeholder="Or enter logo URL"
                              value={eventForm.branding?.assets?.logoUrl || ''}
                              onChange={(e) => setEventForm({
                                ...eventForm,
                                branding: {
                                  ...eventForm.branding,
                                  assets: {
                                    ...eventForm.branding?.assets,
                                    logoUrl: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Event Banner</Label>
                          <div className="mt-2">
                            <Input
                              placeholder="Banner image URL"
                              value={eventForm.branding?.assets?.bannerUrl || ''}
                              onChange={(e) => setEventForm({
                                ...eventForm,
                                branding: {
                                  ...eventForm.branding,
                                  assets: {
                                    ...eventForm.branding?.assets,
                                    bannerUrl: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Watermark</Label>
                          <div className="mt-2">
                            <Input
                              placeholder="Watermark image URL"
                              value={eventForm.branding?.assets?.watermarkUrl || ''}
                              onChange={(e) => setEventForm({
                                ...eventForm,
                                branding: {
                                  ...eventForm.branding,
                                  assets: {
                                    ...eventForm.branding?.assets,
                                    watermarkUrl: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Player Theme</Label>
                          <Select
                            value={eventForm.branding?.playerTheme || 'default'}
                            onValueChange={(value: 'default' | 'minimal' | 'branded' | 'premium') =>
                              setEventForm({
                                ...eventForm,
                                branding: {
                                  ...eventForm.branding,
                                  playerTheme: value
                                }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="branded">Branded</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Custom CSS */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="h-5 w-5" />
                        Custom CSS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="/* Enter custom CSS for advanced styling */\n.event-title { font-weight: bold; }\n.chat-message { color: #333; }"
                        value={eventForm.branding?.customCSS || ''}
                        onChange={(e) => setEventForm({
                          ...eventForm,
                          branding: {
                            ...eventForm.branding,
                            customCSS: e.target.value
                          }
                        })}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </CardContent>
                  </Card>

                  {/* Live Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Live Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="p-6 rounded-lg border" 
                        style={{ 
                          backgroundColor: eventForm.branding?.theme?.primaryColor || '#3b82f6',
                          color: 'white',
                          fontFamily: eventForm.branding?.theme?.fontFamily || 'Inter'
                        }}
                      >
                        <h3 className="text-xl font-bold mb-2">{eventForm.name || 'Your Event Title'}</h3>
                        <p className="text-sm opacity-90">{eventForm.description || 'Event description will appear here'}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <Badge 
                            style={{ 
                              backgroundColor: eventForm.branding?.theme?.accentColor || '#f59e0b',
                              color: 'black'
                            }}
                          >
                            Live
                          </Badge>
                          <span className="text-sm">234 viewers</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Enhanced Access Control Tab */}
                <TabsContent value="access" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Privacy Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Privacy & Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Event Privacy</Label>
                          <Select
                            value={eventForm.access?.privacy || 'public'}
                            onValueChange={(value: 'public' | 'unlisted' | 'private' | 'password') =>
                              setEventForm({
                                ...eventForm,
                                access: {
                                  ...eventForm.access,
                                  privacy: value
                                }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4" />
                                  Public - Anyone can discover and join
                                </div>
                              </SelectItem>
                              <SelectItem value="unlisted">
                                <div className="flex items-center gap-2">
                                  <Link2 className="h-4 w-4" />
                                  Unlisted - Direct link access only
                                </div>
                              </SelectItem>
                              <SelectItem value="private">
                                <div className="flex items-center gap-2">
                                  <Lock className="h-4 w-4" />
                                  Private - Invitation only
                                </div>
                              </SelectItem>
                              <SelectItem value="password">
                                <div className="flex items-center gap-2">
                                  <Key className="h-4 w-4" />
                                  Password Protected
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {eventForm.access?.privacy === 'password' && (
                          <div>
                            <Label>Event Password</Label>
                            <Input
                              type="password"
                              placeholder="Enter event password"
                              value={eventForm.access?.password || ''}
                              onChange={(e) => setEventForm({
                                ...eventForm,
                                access: {
                                  ...eventForm.access,
                                  password: e.target.value
                                }
                              })}
                            />
                          </div>
                        )}

                        <div>
                          <Label>Registration Type</Label>
                          <Select
                            value={eventForm.access?.registration || 'none'}
                            onValueChange={(value: 'none' | 'optional' | 'required' | 'approval') =>
                              setEventForm({
                                ...eventForm,
                                access: {
                                  ...eventForm.access,
                                  registration: value
                                }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Registration Required</SelectItem>
                              <SelectItem value="optional">Optional Registration</SelectItem>
                              <SelectItem value="required">Required Registration</SelectItem>
                              <SelectItem value="approval">Approval Required</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Access Features */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users2 className="h-5 w-5" />
                          Access Features
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Waiting Room</Label>
                            <p className="text-sm text-muted-foreground">Hold attendees before event starts</p>
                          </div>
                          <Switch
                            checked={eventForm.access?.features?.waitingRoom || false}
                            onCheckedChange={(checked) =>
                              setEventForm({
                                ...eventForm,
                                access: {
                                  ...eventForm.access,
                                  features: {
                                    ...eventForm.access?.features,
                                    waitingRoom: checked
                                  }
                                }
                              })
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Lobby System</Label>
                            <p className="text-sm text-muted-foreground">Pre-event networking area</p>
                          </div>
                          <Switch
                            checked={eventForm.access?.features?.lobby || false}
                            onCheckedChange={(checked) =>
                              setEventForm({
                                ...eventForm,
                                access: {
                                  ...eventForm.access,
                                  features: {
                                    ...eventForm.access?.features,
                                    lobby: checked
                                  }
                                }
                              })
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>VIP Access</Label>
                            <p className="text-sm text-muted-foreground">Premium attendee features</p>
                          </div>
                          <Switch
                            checked={eventForm.access?.features?.vipAccess || false}
                            onCheckedChange={(checked) =>
                              setEventForm({
                                ...eventForm,
                                access: {
                                  ...eventForm.access,
                                  features: {
                                    ...eventForm.access?.features,
                                    vipAccess: checked
                                  }
                                }
                              })
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Breakout Rooms</Label>
                            <p className="text-sm text-muted-foreground">Private sub-rooms for groups</p>
                          </div>
                          <Switch
                            checked={eventForm.access?.features?.breakoutRooms || false}
                            onCheckedChange={(checked) =>
                              setEventForm({
                                ...eventForm,
                                access: {
                                  ...eventForm.access,
                                  features: {
                                    ...eventForm.access?.features,
                                    breakoutRooms: checked
                                  }
                                }
                              })
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Geographic and Time Restrictions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Geographic Restrictions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Allowed Countries</Label>
                          <Textarea
                            placeholder="Enter country codes separated by commas\nExample: US, CA, GB, AU"
                            value={eventForm.access?.restrictions?.geographic?.join(', ') || ''}
                            onChange={(e) => setEventForm({
                              ...eventForm,
                              access: {
                                ...eventForm.access,
                                restrictions: {
                                  ...eventForm.access?.restrictions,
                                  geographic: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                                }
                              }
                            })}
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label>Domain Restrictions</Label>
                          <Textarea
                            placeholder="Restrict to company domains\nExample: company.com, partner.org"
                            value={eventForm.access?.restrictions?.domainRestrictions?.join('\n') || ''}
                            onChange={(e) => setEventForm({
                              ...eventForm,
                              access: {
                                ...eventForm.access,
                                restrictions: {
                                  ...eventForm.access?.restrictions,
                                  domainRestrictions: e.target.value.split('\n').filter(Boolean)
                                }
                              }
                            })}
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock3 className="h-5 w-5" />
                          Time & Device Limits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Device Limit per User</Label>
                          <Input
                            type="number"
                            placeholder="Maximum devices (leave empty for unlimited)"
                            value={eventForm.access?.restrictions?.deviceLimit || ''}
                            onChange={(e) => setEventForm({
                              ...eventForm,
                              access: {
                                ...eventForm.access,
                                restrictions: {
                                  ...eventForm.access?.restrictions,
                                  deviceLimit: parseInt(e.target.value) || undefined
                                }
                              }
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Recording Access</Label>
                          <Select
                            value={eventForm.access?.features?.recordingAccess || 'all'}
                            onValueChange={(value: 'all' | 'registered' | 'vip' | 'none') =>
                              setEventForm({
                                ...eventForm,
                                access: {
                                  ...eventForm.access,
                                  features: {
                                    ...eventForm.access?.features,
                                    recordingAccess: value
                                  }
                                }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Attendees</SelectItem>
                              <SelectItem value="registered">Registered Only</SelectItem>
                              <SelectItem value="vip">VIP Only</SelectItem>
                              <SelectItem value="none">No Access</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Pricing & Ticketing Tab */}
                <TabsContent value="pricing" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ticket Type */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Ticket className="h-5 w-5" />
                          Ticketing System
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Ticket Type</Label>
                          <Select
                            value={eventForm.access?.ticketing?.type || 'free'}
                            onValueChange={(value: 'free' | 'paid' | 'tiered') =>
                              setEventForm({
                                ...eventForm,
                                access: {
                                  ...eventForm.access,
                                  ticketing: {
                                    ...eventForm.access?.ticketing,
                                    type: value
                                  }
                                }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-green-500" />
                                  Free Event
                                </div>
                              </SelectItem>
                              <SelectItem value="paid">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  Single Price
                                </div>
                              </SelectItem>
                              <SelectItem value="tiered">
                                <div className="flex items-center gap-2">
                                  <Crown className="h-4 w-4" />
                                  Tiered Pricing
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {eventForm.access?.ticketing?.type === 'paid' && (
                          <div>
                            <Label>Event Price</Label>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="49.99"
                                value={eventForm.access?.ticketing?.price || ''}
                                onChange={(e) => setEventForm({
                                  ...eventForm,
                                  access: {
                                    ...eventForm.access,
                                    ticketing: {
                                      ...eventForm.access?.ticketing,
                                      price: parseFloat(e.target.value) || undefined
                                    }
                                  }
                                })}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Promotional Codes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tag className="h-5 w-5" />
                          Promotional Codes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">EARLY25</Badge>
                                <span className="text-sm font-medium">25% off</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Expires March 5, 2024</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Promo Code
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Revenue Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Revenue Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Tickets Sold</span>
                          </div>
                          <p className="text-2xl font-bold mt-1">0</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Revenue</span>
                          </div>
                          <p className="text-2xl font-bold mt-1">$0.00</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <PercentCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Conversion</span>
                          </div>
                          <p className="text-2xl font-bold mt-1">0%</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Avg Rating</span>
                          </div>
                          <p className="text-2xl font-bold mt-1">N/A</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEvent}>
                  {dialogMode === 'create' ? 'Create Event' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}