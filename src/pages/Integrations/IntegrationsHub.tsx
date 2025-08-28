import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Zap,
  Plus,
  Settings,
  Check,
  X,
  AlertCircle,
  Info,
  ExternalLink,
  Key,
  RefreshCw,
  Link,
  Unlink,
  ArrowRight,
  Shield,
  Clock,
  Activity,
  Database,
  Cloud,
  Mail,
  MessageSquare,
  Video,
  Music,
  Share2,
  Youtube,
  Facebook,
  Twitter,
  Instagram,
  Twitch,
  Globe,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Package,
  Truck,
  Calendar,
  Users,
  UserPlus,
  BarChart3,
  PieChart,
  TrendingUp,
  Webhook,
  Code,
  Terminal,
  Trash2,
  Copy,
  Smartphone
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'streaming' | 'social' | 'payment' | 'analytics' | 'marketing' | 'storage' | 'communication';
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'error';
  config?: Record<string, any>;
  lastSync?: Date;
  features?: string[];
  premium?: boolean;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: Date;
  successRate: number;
}

export const IntegrationsHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Stream simultaneously to YouTube Live',
      category: 'streaming',
      icon: Youtube,
      status: 'connected',
      lastSync: new Date(),
      features: ['Multi-streaming', 'Auto-publish', 'Analytics sync'],
      config: {
        channelId: 'UCxxxxxxxxxxxxxx',
        apiKey: 'AIza...'
      }
    },
    {
      id: 'twitch',
      name: 'Twitch',
      description: 'Broadcast to Twitch and import chat',
      category: 'streaming',
      icon: Twitch,
      status: 'disconnected',
      features: ['Multi-streaming', 'Chat sync', 'Emotes support']
    },
    {
      id: 'facebook',
      name: 'Facebook Live',
      description: 'Stream to Facebook pages and groups',
      category: 'social',
      icon: Facebook,
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2),
      features: ['Page streaming', 'Group streaming', 'Event integration']
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Process payments and subscriptions',
      category: 'payment',
      icon: CreditCard,
      status: 'connected',
      config: {
        publishableKey: 'pk_live_...',
        webhookSecret: 'whsec_...'
      },
      features: ['Payment processing', 'Subscriptions', 'Invoicing', 'Tax calculation']
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Track viewer behavior and engagement',
      category: 'analytics',
      icon: BarChart3,
      status: 'connected',
      features: ['Event tracking', 'Audience insights', 'Conversion tracking']
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing and automation',
      category: 'marketing',
      icon: Mail,
      status: 'disconnected',
      features: ['Email campaigns', 'Automation', 'Audience sync'],
      premium: true
    },
    {
      id: 's3',
      name: 'Amazon S3',
      description: 'Cloud storage for VOD and assets',
      category: 'storage',
      icon: Cloud,
      status: 'connected',
      config: {
        bucket: 'my-streaming-bucket',
        region: 'us-east-1'
      },
      features: ['Unlimited storage', 'CDN integration', 'Backup & archive']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team notifications and alerts',
      category: 'communication',
      icon: MessageSquare,
      status: 'error',
      features: ['Real-time alerts', 'Stream notifications', 'Team chat']
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Import Zoom webinars as streams',
      category: 'streaming',
      icon: Video,
      status: 'disconnected',
      features: ['Webinar import', 'Recording sync', 'Participant data'],
      premium: true
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Background music and playlists',
      category: 'streaming',
      icon: Music,
      status: 'disconnected',
      features: ['Licensed music', 'Playlist sync', 'Now playing widget']
    }
  ]);

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      url: 'https://api.example.com/webhook',
      events: ['stream.started', 'stream.ended', 'viewer.joined'],
      status: 'active',
      lastTriggered: new Date(Date.now() - 1000 * 60 * 30),
      successRate: 98.5
    },
    {
      id: '2',
      url: 'https://analytics.example.com/events',
      events: ['payment.completed', 'subscription.created'],
      status: 'active',
      lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 2),
      successRate: 100
    }
  ]);

  const categories = [
    { id: 'all', label: 'All Integrations', icon: Zap },
    { id: 'streaming', label: 'Streaming', icon: Video },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'marketing', label: 'Marketing', icon: TrendingUp },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'communication', label: 'Communication', icon: MessageSquare }
  ];

  const webhookEvents = [
    'stream.started',
    'stream.ended',
    'stream.error',
    'viewer.joined',
    'viewer.left',
    'chat.message',
    'payment.completed',
    'payment.failed',
    'subscription.created',
    'subscription.cancelled',
    'recording.ready',
    'transcoding.completed'
  ];

  const connectIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigDialog(true);
  };

  const disconnectIntegration = (id: string) => {
    setIntegrations(integrations.map(i => 
      i.id === id ? { ...i, status: 'disconnected', config: undefined } : i
    ));
    toast({
      title: "Integration Disconnected",
      description: "The integration has been disconnected successfully"
    });
  };

  const saveIntegrationConfig = () => {
    if (!selectedIntegration) return;
    
    setIntegrations(integrations.map(i => 
      i.id === selectedIntegration.id 
        ? { ...i, status: 'connected', lastSync: new Date() }
        : i
    ));
    setShowConfigDialog(false);
    setSelectedIntegration(null);
    
    toast({
      title: "Integration Connected",
      description: `${selectedIntegration.name} has been connected successfully`
    });
  };

  const testWebhook = (webhook: WebhookEndpoint) => {
    toast({
      title: "Webhook Test Sent",
      description: `Test event sent to ${webhook.url}`
    });
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integrations Hub</h1>
          <p className="text-muted-foreground">Connect your favorite tools and services</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Integration
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">Active integrations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">Total integrations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.length}</div>
            <p className="text-xs text-muted-foreground">Active endpoints</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {/* Category Filter */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <ScrollArea className="w-full md:w-auto">
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <category.icon className="h-4 w-4 mr-2" />
                      {category.label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>

          {/* Integration Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map(integration => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <integration.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {integration.name}
                          {integration.premium && (
                            <Badge variant="secondary" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {integration.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={
                      integration.status === 'connected' ? 'default' :
                      integration.status === 'error' ? 'destructive' :
                      'secondary'
                    }>
                      {integration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {integration.features && (
                    <div className="space-y-2 mb-4">
                      {integration.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-3 w-3" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {integration.status === 'connected' && integration.lastSync && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Clock className="h-3 w-3" />
                      Last synced {new Date(integration.lastSync).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {integration.status === 'connected' ? (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disconnectIntegration(integration.id)}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : integration.status === 'error' ? (
                    <Button variant="destructive" size="sm" className="w-full">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Fix Connection
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => connectIntegration(integration)}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Featured Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Integrations</CardTitle>
              <CardDescription>Recommended integrations for your use case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Twitch className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Twitch Integration</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Stream to Twitch and import viewer engagement
                    </p>
                    <Button size="sm" variant="outline">
                      Learn More
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">PayPal Integration</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Accept payments worldwide with PayPal
                    </p>
                    <Button size="sm" variant="outline">
                      Learn More
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Webhook Endpoints</CardTitle>
                  <CardDescription>Manage webhook endpoints for real-time events</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Endpoint
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map(webhook => (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono text-sm">{webhook.url}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {webhook.successRate}% success rate
                          </span>
                          {webhook.lastTriggered && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last triggered {new Date(webhook.lastTriggered).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={
                        webhook.status === 'active' ? 'default' :
                        webhook.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {webhook.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {webhook.events.map((event, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => testWebhook(webhook)}>
                        <Zap className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>Available events for webhook subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {webhookEvents.map(event => (
                  <div key={event} className="flex items-center gap-2 p-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{event}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Manage API keys and access tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value="sk_live_********************************"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Keep your API key secure. Never share it publicly or commit it to version control.
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <div className="flex gap-2">
                  <Input
                    value="https://api.bigfootlive.io/v1"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Docs
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Rate Limits</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API Calls</span>
                      <span>8,421 / 10,000 this month</span>
                    </div>
                    <Progress value={84.21} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Webhook Events</span>
                      <span>45,123 / 100,000 this month</span>
                    </div>
                    <Progress value={45.123} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OAuth Applications</CardTitle>
              <CardDescription>Manage third-party application access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Stream Manager Pro</p>
                      <p className="text-sm text-muted-foreground">
                        Authorized on Jan 15, 2024
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Revoke Access
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-muted-foreground">
                        Authorized on Feb 1, 2024
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Revoke Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration ? `Connect ${selectedIntegration.name}` : 'Configure Integration'}
            </DialogTitle>
            <DialogDescription>
              Enter your credentials to connect this integration
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {selectedIntegration.name} requires API credentials to connect. You can find these in your {selectedIntegration.name} dashboard.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder={`Enter your ${selectedIntegration.name} API key`}
                  />
                </div>
                
                {selectedIntegration.id === 'stripe' && (
                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret</Label>
                    <Input
                      id="webhook-secret"
                      type="password"
                      placeholder="whsec_..."
                    />
                  </div>
                )}
                
                {selectedIntegration.id === 'youtube' && (
                  <div className="space-y-2">
                    <Label htmlFor="channel-id">Channel ID</Label>
                    <Input
                      id="channel-id"
                      placeholder="UCxxxxxxxxxxxxxx"
                    />
                  </div>
                )}
                
                {selectedIntegration.id === 's3' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bucket">Bucket Name</Label>
                      <Input
                        id="bucket"
                        placeholder="my-streaming-bucket"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select defaultValue="us-east-1">
                        <SelectTrigger id="region">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                          <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                          <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                          <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-3 w-3" />
                    Read your {selectedIntegration.name} account information
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-3 w-3" />
                    Send data to {selectedIntegration.name}
                  </div>
                  {selectedIntegration.category === 'streaming' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3" />
                      Broadcast streams to your account
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveIntegrationConfig}>
                  <Link className="h-4 w-4 mr-2" />
                  Connect {selectedIntegration.name}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsHub;