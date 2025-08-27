import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  ToggleLeft, 
  ToggleRight,
  ChevronDown,
  ChevronRight,
  Settings,
  Users,
  Building,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart,
  FlaskConical,
  Zap,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

// Types
interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: 'premium' | 'beta' | 'experimental';
  flag_type: 'boolean' | 'percentage' | 'variant' | 'conditional';
  status: 'active' | 'inactive' | 'archived' | 'scheduled';
  default_enabled: boolean;
  default_percentage?: number;
  default_variant?: string;
  config: Record<string, any>;
  variants: string[];
  rollout_strategy: string;
  rollout_percentage?: number;
  created_at: string;
  updated_at: string;
  tenant_overrides?: TenantOverride[];
}

interface TenantOverride {
  tenant_id: string;
  tenant_name: string;
  enabled?: boolean;
  percentage?: number;
  variant?: string;
  expires_at?: string;
}

interface Experiment {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  control_variant: string;
  test_variants: any[];
  traffic_allocation: Record<string, number>;
  start_date?: string;
  end_date?: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity_type?: string;
  old_value?: any;
  new_value?: any;
  change_reason?: string;
  tenant_id?: string;
  user_id?: string;
  created_at: string;
  created_by?: string;
}

const categoryIcons = {
  premium: Shield,
  beta: FlaskConical,
  experimental: Zap,
};

const categoryColors = {
  premium: 'bg-purple-100 text-purple-800',
  beta: 'bg-blue-100 text-blue-800',
  experimental: 'bg-orange-100 text-orange-800',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  archived: 'bg-red-100 text-red-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
};

export function FeatureFlags() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTenantOverrideDialog, setShowTenantOverrideDialog] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  // Fetch feature flags
  useEffect(() => {
    fetchFeatureFlags();
  }, [selectedCategory, selectedStatus]);

  const fetchFeatureFlags = async () => {
    setLoading(true);
    try {
      // Use the API client method instead of raw get
      const response = await api.getFeatureFlags();
      
      // If backend returns empty or null, show sample data for demo
      let data = response || [];
      
      if (!response || response.length === 0) {
        // Sample feature flags for demonstration
        const sampleFlags: FeatureFlag[] = [
          {
            id: '1',
            key: 'premium.streaming.4k',
            name: '4K Streaming',
            description: 'Enable 4K quality streaming for premium users',
            category: 'premium',
            flag_type: 'boolean',
            status: 'active',
            default_enabled: true,
            config: {},
            variants: [],
            rollout_strategy: 'all_users',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            key: 'beta.webrtc.multipresenter',
            name: 'Multi-Presenter WebRTC',
            description: 'Allow multiple presenters in a single stream using WebRTC',
            category: 'beta',
            flag_type: 'percentage',
            status: 'active',
            default_enabled: false,
            default_percentage: 25,
            rollout_percentage: 25,
            config: { max_presenters: 4 },
            variants: [],
            rollout_strategy: 'percentage',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            tenant_overrides: [
              {
                tenant_id: 'tenant-1',
                tenant_name: 'Acme Corp',
                enabled: true,
                percentage: 100,
              },
            ],
          },
          {
            id: '3',
            key: 'experimental.ai.transcription',
            name: 'AI Live Transcription',
            description: 'Real-time AI-powered transcription and closed captions',
            category: 'experimental',
            flag_type: 'variant',
            status: 'active',
            default_enabled: false,
            default_variant: 'off',
            config: { models: ['whisper', 'deepgram'] },
            variants: ['off', 'whisper', 'deepgram'],
            rollout_strategy: 'tenant_ids',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '4',
            key: 'premium.analytics.advanced',
            name: 'Advanced Analytics Dashboard',
            description: 'Enhanced analytics with viewer heatmaps and engagement metrics',
            category: 'premium',
            flag_type: 'boolean',
            status: 'inactive',
            default_enabled: false,
            config: {},
            variants: [],
            rollout_strategy: 'all_users',
            created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        data = sampleFlags;
        toast({
          title: 'Info',
          description: 'Showing sample feature flags. Connect to backend for real data.',
        });
      }
      
      // Filter based on selected category and status
      let filteredData = data;
      
      if (selectedCategory !== 'all') {
        filteredData = filteredData.filter((flag: FeatureFlag) => flag.category === selectedCategory);
      }
      
      if (selectedStatus !== 'all') {
        filteredData = filteredData.filter((flag: FeatureFlag) => flag.status === selectedStatus);
      }
      
      setFlags(filteredData);
      
      // Update experiments with sample data if needed
      if (data.length > 0 && experiments.length === 0) {
        const sampleExperiments: Experiment[] = [
          {
            id: 'exp-1',
            name: 'WebRTC Performance Test',
            status: 'running',
            control_variant: 'websocket',
            test_variants: ['webrtc-v1', 'webrtc-v2'],
            traffic_allocation: {
              websocket: 50,
              'webrtc-v1': 25,
              'webrtc-v2': 25,
            },
            start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setExperiments(sampleExperiments);
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      // Show sample data even on error for better UX
      const sampleFlag: FeatureFlag = {
        id: 'demo-1',
        key: 'demo.feature',
        name: 'Demo Feature',
        description: 'Sample feature flag for demonstration',
        category: 'beta',
        flag_type: 'boolean',
        status: 'active',
        default_enabled: false,
        config: {},
        variants: [],
        rollout_strategy: 'all_users',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setFlags([sampleFlag]);
      toast({
        title: 'Warning',
        description: 'Using demo data. Backend connection unavailable.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (flagKey?: string) => {
    try {
      // Audit logs endpoint may not exist, so we'll handle gracefully
      // In a real implementation, this would fetch from an audit log endpoint
      setAuditLogs([]);
      
      // Mock data for demonstration - remove when real endpoint exists
      if (flagKey) {
        const mockLogs: AuditLog[] = [
          {
            id: '1',
            action: 'updated',
            entity_type: 'feature_flag',
            change_reason: 'Enabled for testing',
            created_at: new Date().toISOString(),
            created_by: 'admin@example.com',
          },
        ];
        setAuditLogs(mockLogs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    }
  };

  const handleToggleFlag = async (flag: FeatureFlag) => {
    try {
      // Use the API client updateFeatureFlag method
      await api.updateFeatureFlag(flag.id, {
        ...flag,
        default_enabled: !flag.default_enabled,
      });

      toast({
        title: 'Success',
        description: `Feature flag "${flag.name}" has been ${!flag.default_enabled ? 'enabled' : 'disabled'}`,
      });

      fetchFeatureFlags();
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to update feature flag. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTenantOverride = async (flagKey: string, tenantId: string, overrideData: any) => {
    try {
      // Find the flag to update
      const flag = flags.find(f => f.key === flagKey);
      if (!flag) throw new Error('Flag not found');
      
      // Update the flag with tenant override
      const updatedFlag = {
        ...flag,
        tenant_overrides: [
          ...(flag.tenant_overrides || []).filter(o => o.tenant_id !== tenantId),
          { tenant_id: tenantId, tenant_name: `Tenant ${tenantId}`, ...overrideData }
        ]
      };
      
      await api.updateFeatureFlag(flag.id, updatedFlag);

      toast({
        title: 'Success',
        description: 'Tenant override updated successfully',
      });

      fetchFeatureFlags();
      setShowTenantOverrideDialog(false);
    } catch (error) {
      console.error('Error updating tenant override:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tenant override. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateFlag = async (flagData: any) => {
    try {
      // Use the API client createFeatureFlag method
      const newFlag = {
        ...flagData,
        id: Date.now().toString(), // Temporary ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        config: {},
        variants: [],
        rollout_strategy: 'all_users',
      };
      
      await api.createFeatureFlag(newFlag);

      toast({
        title: 'Success',
        description: 'Feature flag created successfully',
      });

      fetchFeatureFlags();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create feature flag. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredFlags = flags.filter(flag => {
    if (searchTerm && !flag.key.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !flag.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground mt-1">
            Manage platform features, A/B tests, and tenant-specific configurations
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Flag
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Flags</p>
                <p className="text-2xl font-bold">{flags.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Flags</p>
                <p className="text-2xl font-bold">
                  {flags.filter(f => f.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Beta Features</p>
                <p className="text-2xl font-bold">
                  {flags.filter(f => f.category === 'beta').length}
                </p>
              </div>
              <FlaskConical className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running Experiments</p>
                <p className="text-2xl font-bold">{experiments.filter(e => e.status === 'running').length}</p>
              </div>
              <BarChart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search flags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flag</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Rollout</TableHead>
                <TableHead>Overrides</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-b-transparent" />
                      <span className="text-muted-foreground">Loading feature flags...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredFlags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <p className="text-lg mb-2">No feature flags found</p>
                      <p className="text-sm">Create your first feature flag to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFlags.map((flag) => {
                const CategoryIcon = categoryIcons[flag.category];
                return (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{flag.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {flag.key}
                        </div>
                        {flag.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {flag.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[flag.category]}>
                        <CategoryIcon className="mr-1 h-3 w-3" />
                        {flag.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{flag.flag_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[flag.status]}>
                        {flag.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={flag.default_enabled}
                        onCheckedChange={() => handleToggleFlag(flag)}
                        disabled={flag.status !== 'active'}
                      />
                    </TableCell>
                    <TableCell>
                      {flag.rollout_percentage !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${flag.rollout_percentage}%` }}
                            />
                          </div>
                          <span className="text-sm">{flag.rollout_percentage}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {flag.tenant_overrides && flag.tenant_overrides.length > 0 ? (
                        <Badge variant="secondary">
                          {flag.tenant_overrides.length} tenants
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedFlag(flag);
                                  fetchAuditLogs(flag.key);
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Configure</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedFlag(flag);
                                  setShowTenantOverrideDialog(true);
                                }}
                              >
                                <Building className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Tenant Overrides</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedFlag(flag);
                                  fetchAuditLogs(flag.key);
                                }}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View History</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      {selectedFlag && (
        <Dialog open={!!selectedFlag && !showTenantOverrideDialog} onOpenChange={() => setSelectedFlag(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedFlag.name}</DialogTitle>
              <DialogDescription>{selectedFlag.key}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="rollout">Rollout</TabsTrigger>
                <TabsTrigger value="experiments">Experiments</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={selectedFlag.name} readOnly />
                  </div>
                  <div>
                    <Label>Key</Label>
                    <Input value={selectedFlag.key} readOnly className="font-mono" />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea value={selectedFlag.description || ''} readOnly />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={selectedFlag.category} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="beta">Beta</SelectItem>
                        <SelectItem value="experimental">Experimental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={selectedFlag.flag_type} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="variant">Variant</SelectItem>
                        <SelectItem value="conditional">Conditional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={selectedFlag.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedFlag.variants && selectedFlag.variants.length > 0 && (
                  <div>
                    <Label>Variants</Label>
                    <div className="flex gap-2 mt-2">
                      {selectedFlag.variants.map((variant) => (
                        <Badge key={variant} variant="secondary">
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rollout" className="space-y-4">
                <div>
                  <Label>Rollout Strategy</Label>
                  <Select value={selectedFlag.rollout_strategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="user_ids">Specific Users</SelectItem>
                      <SelectItem value="tenant_ids">Specific Tenants</SelectItem>
                      <SelectItem value="geographic">Geographic</SelectItem>
                      <SelectItem value="time_based">Time Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedFlag.rollout_strategy === 'percentage' && (
                  <div>
                    <Label>Rollout Percentage</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[selectedFlag.rollout_percentage || 0]}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-right">
                        {selectedFlag.rollout_percentage || 0}%
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="experiments" className="space-y-4">
                {experiments.length > 0 ? (
                  <div className="space-y-4">
                    {experiments.map((experiment) => (
                      <Card key={experiment.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>{experiment.name}</CardTitle>
                            <Badge>{experiment.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Control Variant</p>
                              <p className="font-medium">{experiment.control_variant}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Test Variants</p>
                              <p className="font-medium">{experiment.test_variants.length} variants</p>
                            </div>
                          </div>
                          {experiment.traffic_allocation && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground mb-2">Traffic Allocation</p>
                              {Object.entries(experiment.traffic_allocation).map(([variant, percentage]) => (
                                <div key={variant} className="flex items-center gap-2 mb-2">
                                  <span className="w-24 text-sm">{variant}:</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm">{percentage}%</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No experiments configured for this flag
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {auditLogs.length > 0 ? (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-3 border rounded">
                        <div className="mt-1">
                          {log.action === 'created' && <Plus className="h-4 w-4 text-green-600" />}
                          {log.action === 'updated' && <Edit className="h-4 w-4 text-blue-600" />}
                          {log.action === 'deleted' && <XCircle className="h-4 w-4 text-red-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{log.action}</p>
                          {log.change_reason && (
                            <p className="text-sm text-muted-foreground">{log.change_reason}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No history available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Tenant Override Dialog */}
      <Dialog open={showTenantOverrideDialog} onOpenChange={setShowTenantOverrideDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tenant Override</DialogTitle>
            <DialogDescription>
              Configure feature flag override for a specific tenant
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tenant</Label>
              <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant..." />
                </SelectTrigger>
                <SelectContent>
                  {/* These would be loaded from API */}
                  <SelectItem value="tenant1">Tenant 1</SelectItem>
                  <SelectItem value="tenant2">Tenant 2</SelectItem>
                  <SelectItem value="tenant3">Tenant 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="override-enabled" />
              <Label htmlFor="override-enabled">Override enabled state</Label>
            </div>

            {selectedFlag?.flag_type === 'percentage' && (
              <div>
                <Label>Override Percentage</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[50]}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">50%</span>
                </div>
              </div>
            )}

            {selectedFlag?.flag_type === 'variant' && (
              <div>
                <Label>Override Variant</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFlag.variants.map((variant) => (
                      <SelectItem key={variant} value={variant}>
                        {variant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Override Reason</Label>
              <Textarea placeholder="Explain why this override is needed..." />
            </div>

            <div>
              <Label>Expires At (Optional)</Label>
              <Input type="datetime-local" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTenantOverrideDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedFlag && selectedTenantId) {
                  handleUpdateTenantOverride(selectedFlag.key, selectedTenantId, {
                    enabled: true,
                    override_reason: 'Manual override by platform admin',
                  });
                }
              }}
            >
              Save Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Flag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription>
              Define a new feature flag for the platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input placeholder="Multi-presenter WebRTC" />
              </div>
              <div>
                <Label>Key</Label>
                <Input placeholder="premium.webrtc.multipresenter" className="font-mono" />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea placeholder="Describe what this feature flag controls..." />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="variant">Variant</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue="inactive">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="default-enabled" />
              <Label htmlFor="default-enabled">Default enabled</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Create flag logic here
              handleCreateFlag({
                key: 'new.feature.flag',
                name: 'New Feature Flag',
                category: 'beta',
                flag_type: 'boolean',
                default_enabled: false,
              });
            }}>
              Create Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeatureFlags;