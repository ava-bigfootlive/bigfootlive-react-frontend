import React, { useState, useEffect, useCallback } from 'react';
import {
  Crown,
  Star,
  Zap,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Gift,
  Shield,
  Award,
  ChevronRight,
  Settings,
  Download,
  Upload,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  CreditCard,
  RefreshCw,
  Percent,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  limits: {
    streamingHours?: number;
    storageGB?: number;
    viewers?: number;
    customBranding?: boolean;
    analytics?: boolean;
    support?: 'basic' | 'priority' | 'dedicated';
  };
  badge?: string;
  color: string;
  icon: React.ReactNode;
  isPopular?: boolean;
  discountPercentage?: number;
  trialDays?: number;
  isActive: boolean;
  subscriberCount: number;
  revenue: number;
}

interface Subscriber {
  id: string;
  userId: string;
  username: string;
  email: string;
  avatar?: string;
  tierId: string;
  tierName: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'cancelled' | 'expired' | 'trialing' | 'past_due';
  paymentMethod: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  totalPaid: number;
  customerId?: string;
  subscriptionId?: string;
}

interface SubscriptionMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  churnRate: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  averageRevenue: number;
  lifetimeValue: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  retention: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
    oneYear: number;
  };
}

const defaultTiers: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for getting started',
    price: 9.99,
    billingPeriod: 'monthly',
    features: [
      'Up to 10 hours streaming/month',
      '720p video quality',
      'Basic analytics',
      'Email support',
      'Chat features'
    ],
    limits: {
      streamingHours: 10,
      storageGB: 5,
      viewers: 100,
      customBranding: false,
      analytics: true,
      support: 'basic'
    },
    badge: 'Basic',
    color: '#6b7280',
    icon: <Star className="h-5 w-5" />,
    isActive: true,
    subscriberCount: 450,
    revenue: 4495.50,
    trialDays: 7
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional streamers',
    price: 29.99,
    billingPeriod: 'monthly',
    features: [
      'Unlimited streaming',
      '1080p video quality',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Viewer engagement tools',
      'Recording & clips'
    ],
    limits: {
      streamingHours: undefined,
      storageGB: 50,
      viewers: 1000,
      customBranding: true,
      analytics: true,
      support: 'priority'
    },
    badge: 'Pro',
    color: '#3b82f6',
    icon: <Zap className="h-5 w-5" />,
    isPopular: true,
    isActive: true,
    subscriberCount: 280,
    revenue: 8397.20,
    trialDays: 14
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Enterprise-grade features',
    price: 99.99,
    billingPeriod: 'monthly',
    features: [
      'Everything in Pro',
      '4K video quality',
      'White-label solution',
      'Dedicated support',
      'API access',
      'Multiple team members',
      'Advanced security',
      'Custom integrations'
    ],
    limits: {
      streamingHours: undefined,
      storageGB: 500,
      viewers: undefined,
      customBranding: true,
      analytics: true,
      support: 'dedicated'
    },
    badge: 'Premium',
    color: '#a855f7',
    icon: <Crown className="h-5 w-5" />,
    isActive: true,
    subscriberCount: 45,
    revenue: 4499.55,
    discountPercentage: 20,
    trialDays: 30
  }
];

const SubscriptionManager: React.FC = () => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>(defaultTiers);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetrics>({
    totalSubscribers: 775,
    activeSubscribers: 720,
    churnRate: 5.2,
    mrr: 17392.25,
    arr: 208707,
    averageRevenue: 24.16,
    lifetimeValue: 289.92,
    growth: {
      daily: 2.3,
      weekly: 8.7,
      monthly: 15.4
    },
    retention: {
      oneMonth: 92,
      threeMonths: 85,
      sixMonths: 78,
      oneYear: 65
    }
  });
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isCreatingTier, setIsCreatingTier] = useState(false);
  const [isEditingTier, setIsEditingTier] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Subscriber['status']>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showMetrics, setShowMetrics] = useState(true);
  
  // Form states
  const [tierForm, setTierForm] = useState<Partial<SubscriptionTier>>({
    name: '',
    description: '',
    price: 0,
    billingPeriod: 'monthly',
    features: [],
    trialDays: 0,
    isActive: true
  });
  const [newFeature, setNewFeature] = useState('');

  // Load subscribers
  useEffect(() => {
    // Mock data - replace with API call
    const mockSubscribers: Subscriber[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'john_doe',
        email: 'john@example.com',
        tierId: 'pro',
        tierName: 'Pro',
        startDate: new Date('2024-01-15'),
        status: 'active',
        paymentMethod: 'Visa •••• 4242',
        lastPaymentDate: new Date('2024-11-15'),
        nextPaymentDate: new Date('2024-12-15'),
        totalPaid: 359.88,
        customerId: 'cus_123456',
        subscriptionId: 'sub_123456'
      },
      {
        id: '2',
        userId: 'user2',
        username: 'jane_smith',
        email: 'jane@example.com',
        tierId: 'premium',
        tierName: 'Premium',
        startDate: new Date('2024-03-01'),
        status: 'active',
        paymentMethod: 'PayPal',
        lastPaymentDate: new Date('2024-11-01'),
        nextPaymentDate: new Date('2024-12-01'),
        totalPaid: 899.91,
        customerId: 'cus_234567',
        subscriptionId: 'sub_234567'
      },
      {
        id: '3',
        userId: 'user3',
        username: 'mike_wilson',
        email: 'mike@example.com',
        tierId: 'basic',
        tierName: 'Basic',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-11-01'),
        status: 'cancelled',
        paymentMethod: 'Mastercard •••• 5555',
        lastPaymentDate: new Date('2024-10-01'),
        totalPaid: 19.98,
        customerId: 'cus_345678',
        subscriptionId: 'sub_345678'
      }
    ];
    setSubscribers(mockSubscribers);
  }, []);

  // Chart data
  const revenueData = [
    { month: 'Jun', revenue: 12500 },
    { month: 'Jul', revenue: 13800 },
    { month: 'Aug', revenue: 14200 },
    { month: 'Sep', revenue: 15600 },
    { month: 'Oct', revenue: 16800 },
    { month: 'Nov', revenue: 17392 }
  ];

  const tierDistribution = tiers.map(tier => ({
    name: tier.name,
    value: tier.subscriberCount,
    color: tier.color
  }));

  const retentionData = [
    { period: '1 Month', rate: metrics.retention.oneMonth },
    { period: '3 Months', rate: metrics.retention.threeMonths },
    { period: '6 Months', rate: metrics.retention.sixMonths },
    { period: '1 Year', rate: metrics.retention.oneYear }
  ];

  const handleCreateTier = useCallback(() => {
    if (!tierForm.name || !tierForm.price) return;

    const newTier: SubscriptionTier = {
      id: tierForm.name.toLowerCase().replace(/\s+/g, '_'),
      name: tierForm.name,
      description: tierForm.description || '',
      price: tierForm.price,
      billingPeriod: tierForm.billingPeriod || 'monthly',
      features: tierForm.features || [],
      limits: {},
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      icon: <Star className="h-5 w-5" />,
      isActive: tierForm.isActive !== false,
      subscriberCount: 0,
      revenue: 0,
      trialDays: tierForm.trialDays
    };

    setTiers(prev => [...prev, newTier]);
    setIsCreatingTier(false);
    resetForm();
  }, [tierForm]);

  const handleUpdateTier = useCallback(() => {
    if (!selectedTier || !tierForm.name || !tierForm.price) return;

    setTiers(prev => prev.map(tier => 
      tier.id === selectedTier.id
        ? { ...tier, ...tierForm }
        : tier
    ));
    
    setIsEditingTier(false);
    setSelectedTier(null);
    resetForm();
  }, [selectedTier, tierForm]);

  const handleDeleteTier = useCallback((tierId: string) => {
    if (confirm('Are you sure you want to delete this tier? This action cannot be undone.')) {
      setTiers(prev => prev.filter(tier => tier.id !== tierId));
    }
  }, []);

  const handleToggleTierStatus = useCallback((tierId: string) => {
    setTiers(prev => prev.map(tier =>
      tier.id === tierId
        ? { ...tier, isActive: !tier.isActive }
        : tier
    ));
  }, []);

  const handleAddFeature = useCallback(() => {
    if (!newFeature.trim()) return;
    
    setTierForm(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeature.trim()]
    }));
    setNewFeature('');
  }, [newFeature]);

  const handleRemoveFeature = useCallback((index: number) => {
    setTierForm(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const resetForm = () => {
    setTierForm({
      name: '',
      description: '',
      price: 0,
      billingPeriod: 'monthly',
      features: [],
      trialDays: 0,
      isActive: true
    });
    setNewFeature('');
  };

  const handleExportData = useCallback(() => {
    const data = {
      tiers,
      subscribers,
      metrics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscription-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tiers, subscribers, metrics]);

  const filteredSubscribers = subscribers.filter(sub => {
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    if (searchQuery && !sub.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !sub.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subscription Manager</h1>
            <p className="text-muted-foreground">
              Manage your subscription tiers and track subscriber metrics
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            <Dialog open={isCreatingTier} onOpenChange={setIsCreatingTier}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Subscription Tier</DialogTitle>
                  <DialogDescription>
                    Define a new subscription tier with custom features and pricing
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tier Name</Label>
                      <Input
                        id="name"
                        value={tierForm.name}
                        onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Professional"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={tierForm.price}
                          onChange={(e) => setTierForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                          placeholder="29.99"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={tierForm.description}
                      onChange={(e) => setTierForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this tier"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billing">Billing Period</Label>
                      <Select 
                        value={tierForm.billingPeriod}
                        onValueChange={(value: any) => setTierForm(prev => ({ ...prev, billingPeriod: value }))}
                      >
                        <SelectTrigger id="billing">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="lifetime">Lifetime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="trial">Trial Days</Label>
                      <Input
                        id="trial"
                        type="number"
                        value={tierForm.trialDays}
                        onChange={(e) => setTierForm(prev => ({ ...prev, trialDays: parseInt(e.target.value) }))}
                        placeholder="14"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Features</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add a feature..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                      />
                      <Button onClick={handleAddFeature} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {tierForm.features?.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{feature}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveFeature(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="active"
                        checked={tierForm.isActive}
                        onCheckedChange={(checked) => setTierForm(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsCreatingTier(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTier}>
                    Create Tier
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Metrics Overview */}
        {showMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.mrr.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  {metrics.growth.monthly}% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeSubscribers}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  {metrics.growth.weekly}% this week
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.churnRate}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                  0.8% improvement
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Lifetime Value</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.lifetimeValue.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  Per subscriber
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="tiers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tiers">Subscription Tiers</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Tiers Tab */}
          <TabsContent value="tiers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <Card 
                  key={tier.id}
                  className={cn(
                    "relative",
                    !tier.isActive && "opacity-60",
                    tier.isPopular && "ring-2 ring-primary"
                  )}
                >
                  {tier.isPopular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg")} style={{ backgroundColor: `${tier.color}20` }}>
                          {tier.icon}
                        </div>
                        <div>
                          <CardTitle>{tier.name}</CardTitle>
                          <CardDescription>{tier.description}</CardDescription>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedTier(tier);
                            setTierForm(tier);
                            setIsEditingTier(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleToggleTierStatus(tier.id)}>
                            {tier.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTier(tier.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">/{tier.billingPeriod}</span>
                    </div>
                    
                    {tier.trialDays && (
                      <Badge variant="secondary">
                        {tier.trialDays} day free trial
                      </Badge>
                    )}
                    
                    {tier.discountPercentage && (
                      <Badge variant="destructive">
                        {tier.discountPercentage}% OFF
                      </Badge>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Subscribers:</span>
                        <p className="font-semibold">{tier.subscriberCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue:</span>
                        <p className="font-semibold">${tier.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button className="w-full" variant={tier.isActive ? "default" : "secondary"}>
                      {tier.isActive ? 'View Subscribers' : 'Tier Inactive'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subscriber.username}</p>
                          <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subscriber.tierName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          subscriber.status === 'active' ? 'default' :
                          subscriber.status === 'trialing' ? 'secondary' :
                          subscriber.status === 'past_due' ? 'destructive' :
                          'outline'
                        }>
                          {subscriber.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(subscriber.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {subscriber.nextPaymentDate 
                          ? new Date(subscriber.nextPaymentDate).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        ${subscriber.totalPaid.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Update Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Gift className="h-4 w-4 mr-2" />
                              Apply Discount
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Renew Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <X className="h-4 w-4 mr-2" />
                              Cancel Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption>
                  Showing {filteredSubscribers.length} of {subscribers.length} subscribers
                </TableCaption>
              </Table>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly recurring revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Tier Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Tier Distribution</CardTitle>
                  <CardDescription>Subscribers by tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={tierDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tierDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Retention Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Retention Rates</CardTitle>
                  <CardDescription>Subscriber retention over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={retentionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Legend />
                      <Bar dataKey="rate" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                  <CardDescription>Important subscription metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Customer Acquisition Cost</span>
                      <span className="text-sm font-bold">$45.20</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Revenue Per User</span>
                      <span className="text-sm font-bold">${metrics.averageRevenue.toFixed(2)}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monthly Growth Rate</span>
                      <span className="text-sm font-bold">{metrics.growth.monthly}%</span>
                    </div>
                    <Progress value={metrics.growth.monthly * 5} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trial to Paid Conversion</span>
                      <span className="text-sm font-bold">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Annual Recurring Revenue</span>
                      <span className="text-sm font-bold">${metrics.arr.toLocaleString()}</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Settings</CardTitle>
                <CardDescription>
                  Configure global subscription settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-renew Subscriptions</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically renew subscriptions at the end of billing period
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Proration</Label>
                      <p className="text-sm text-muted-foreground">
                        Prorate subscription changes mid-cycle
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Grace Period</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow grace period for failed payments (days)
                      </p>
                    </div>
                    <Input type="number" defaultValue={3} className="w-20" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Send payment reminders before renewal
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cancellation Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email when subscription is cancelled
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Welcome Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Send welcome email to new subscribers
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Trial Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Payment Method</Label>
                      <p className="text-sm text-muted-foreground">
                        Require payment method for free trials
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Trial Reminder</Label>
                      <p className="text-sm text-muted-foreground">
                        Days before trial ends to send reminder
                      </p>
                    </div>
                    <Input type="number" defaultValue={3} className="w-20" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Tier Dialog */}
        <Dialog open={isEditingTier} onOpenChange={setIsEditingTier}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Subscription Tier</DialogTitle>
              <DialogDescription>
                Update tier details and features
              </DialogDescription>
            </DialogHeader>
            
            {/* Similar form as create, pre-filled with tier data */}
            <div className="space-y-4 py-4">
              {/* Form fields (same as create) */}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditingTier(false);
                setSelectedTier(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTier}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default SubscriptionManager;