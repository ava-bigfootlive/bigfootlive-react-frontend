import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  Calendar,
  User,
  Users,
  Video,
  Radio,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Send,
  Clock,
  Filter,
  Archive,
  Trash2,
  Settings,
  Volume2,
  VolumeX,
  Zap,
  Star,
  Heart,
  ThumbsUp,
  Gift,
  Trophy,
  Target,
  ChevronRight
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'payment' | 'stream';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  sender?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

interface NotificationPreference {
  id: string;
  category: string;
  label: string;
  description: string;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export const NotificationCenter: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'stream',
      title: 'Your stream is starting soon',
      message: 'Championship Finals 2024 begins in 15 minutes',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      actionUrl: '/stream/live',
      actionLabel: 'Go Live',
      metadata: { eventId: 'evt_123' }
    },
    {
      id: '2',
      type: 'payment',
      title: 'New subscription',
      message: 'John Doe subscribed to Premium Monthly plan',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      sender: {
        name: 'John Doe',
        avatar: 'https://placehold.co/40x40'
      },
      metadata: { amount: 29.99, plan: 'premium' }
    },
    {
      id: '3',
      type: 'mention',
      title: 'You were mentioned',
      message: 'Sarah mentioned you in Weekly Q&A Session chat',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
      actionUrl: '/chat/qa-session',
      actionLabel: 'View Chat',
      sender: {
        name: 'Sarah Wilson',
        avatar: 'https://placehold.co/40x40'
      }
    },
    {
      id: '4',
      type: 'success',
      title: 'Stream ended successfully',
      message: 'Your stream reached 2,847 peak viewers',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
      actionUrl: '/analytics',
      actionLabel: 'View Analytics',
      metadata: { viewers: 2847, duration: 7200 }
    },
    {
      id: '5',
      type: 'warning',
      title: 'Storage limit warning',
      message: 'You have used 90% of your storage quota',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      actionUrl: '/settings/storage',
      actionLabel: 'Manage Storage'
    }
  ]);

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: '1',
      category: 'Streaming',
      label: 'Stream start reminders',
      description: 'Get notified before your scheduled streams',
      channels: {
        inApp: true,
        email: true,
        push: true,
        sms: false
      }
    },
    {
      id: '2',
      category: 'Streaming',
      label: 'Stream performance',
      description: 'Analytics and milestones during streams',
      channels: {
        inApp: true,
        email: false,
        push: true,
        sms: false
      }
    },
    {
      id: '3',
      category: 'Engagement',
      label: 'Chat mentions',
      description: 'When someone mentions you in chat',
      channels: {
        inApp: true,
        email: false,
        push: true,
        sms: false
      }
    },
    {
      id: '4',
      category: 'Engagement',
      label: 'New followers',
      description: 'When someone follows your channel',
      channels: {
        inApp: true,
        email: true,
        push: false,
        sms: false
      }
    },
    {
      id: '5',
      category: 'Monetization',
      label: 'New subscriptions',
      description: 'When someone subscribes to your content',
      channels: {
        inApp: true,
        email: true,
        push: true,
        sms: true
      }
    },
    {
      id: '6',
      category: 'Monetization',
      label: 'Payment received',
      description: 'Confirmations for payments and tips',
      channels: {
        inApp: true,
        email: true,
        push: false,
        sms: false
      }
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stream': return <Radio className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'mention': return <MessageSquare className="h-4 w-4" />;
      case 'success': return <CheckCircle2 className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <X className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'stream': return 'text-purple-500';
      case 'payment': return 'text-green-500';
      case 'mention': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "Your notification inbox is now clear"
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed"
    });
  };

  const bulkDelete = () => {
    if (selectedNotifications.length === 0) return;
    
    setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    toast({
      title: "Notifications deleted",
      description: `${selectedNotifications.length} notifications removed`
    });
  };

  const updatePreference = (id: string, channel: string, value: boolean) => {
    setPreferences(preferences.map(pref => 
      pref.id === id 
        ? { ...pref, channels: { ...pref.channels, [channel]: value } }
        : pref
    ));
  };

  const filteredNotifications = notifications.filter(n => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'unread') return !n.read;
    if (selectedTab === 'mentions') return n.type === 'mention';
    if (selectedTab === 'streaming') return n.type === 'stream';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout
      title="Notification Center"
      subtitle="Manage your notifications and preferences"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDoNotDisturb(!doNotDisturb)}
          >
            {doNotDisturb ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowCompose(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Do Not Disturb Alert */}
      {doNotDisturb && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <BellOff className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Do Not Disturb is enabled. You won't receive any notifications until you turn it off.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Notifications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => 
                format(n.timestamp, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Received today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.type === 'mention').length}
            </div>
            <p className="text-xs text-muted-foreground">Direct mentions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.actionUrl && !n.read).length}
            </div>
            <p className="text-xs text-muted-foreground">Pending actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notifications
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedNotifications.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={bulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedNotifications.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedNotifications([])}
                  >
                    Clear Selection
                  </Button>
                </>
              )}
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark All as Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="mentions">Mentions</TabsTrigger>
              <TabsTrigger value="streaming">Streaming</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                        !notification.read ? 'bg-muted/50' : 'hover:bg-muted/25'
                      }`}
                    >
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNotifications([...selectedNotifications, notification.id]);
                          } else {
                            setSelectedNotifications(
                              selectedNotifications.filter(id => id !== notification.id)
                            );
                          }
                        }}
                      />
                      
                      <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {notification.sender && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.sender.avatar} />
                          <AvatarFallback>
                            {notification.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {notification.title}
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            {notification.metadata && (
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                {notification.metadata.amount && (
                                  <span>${notification.metadata.amount}</span>
                                )}
                                {notification.metadata.viewers && (
                                  <span>{notification.metadata.viewers} viewers</span>
                                )}
                                {notification.metadata.duration && (
                                  <span>{Math.floor(notification.metadata.duration / 60)} min</span>
                                )}
                              </div>
                            )}
                            {notification.actionUrl && (
                              <Button
                                variant="link"
                                size="sm"
                                className="px-0 mt-2"
                                onClick={() => markAsRead(notification.id)}
                              >
                                {notification.actionLabel || 'View'}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      You're all caught up! Check back later for updates.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
            <DialogDescription>
              Choose how and when you want to receive notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-1 grid-cols-5 text-center text-sm font-medium pb-4">
              <div></div>
              <div>In-App</div>
              <div>Email</div>
              <div>Push</div>
              <div>SMS</div>
            </div>

            {Object.entries(
              preferences.reduce((acc, pref) => {
                if (!acc[pref.category]) acc[pref.category] = [];
                acc[pref.category].push(pref);
                return acc;
              }, {} as Record<string, NotificationPreference[]>)
            ).map(([category, prefs]) => (
              <div key={category} className="space-y-4">
                <h3 className="font-medium">{category}</h3>
                {prefs.map(pref => (
                  <div key={pref.id} className="grid gap-4 grid-cols-5 items-center">
                    <div>
                      <Label>{pref.label}</Label>
                      <p className="text-xs text-muted-foreground">{pref.description}</p>
                    </div>
                    <div className="justify-self-center">
                      <Switch
                        checked={pref.channels.inApp}
                        onCheckedChange={(value) => updatePreference(pref.id, 'inApp', value)}
                      />
                    </div>
                    <div className="justify-self-center">
                      <Switch
                        checked={pref.channels.email}
                        onCheckedChange={(value) => updatePreference(pref.id, 'email', value)}
                      />
                    </div>
                    <div className="justify-self-center">
                      <Switch
                        checked={pref.channels.push}
                        onCheckedChange={(value) => updatePreference(pref.id, 'push', value)}
                      />
                    </div>
                    <div className="justify-self-center">
                      <Switch
                        checked={pref.channels.sms}
                        onCheckedChange={(value) => updatePreference(pref.id, 'sms', value)}
                      />
                    </div>
                  </div>
                ))}
                <Separator />
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowSettings(false);
                toast({
                  title: "Preferences saved",
                  description: "Your notification settings have been updated"
                });
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compose Notification Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a custom notification to users or groups
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipients</Label>
              <Select>
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="subscribers">Subscribers Only</SelectItem>
                  <SelectItem value="moderators">Moderators</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Notification title" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your notification message"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="channel-inapp" defaultChecked />
                  <Label htmlFor="channel-inapp">In-App</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="channel-email" />
                  <Label htmlFor="channel-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="channel-push" />
                  <Label htmlFor="channel-push">Push</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="channel-sms" />
                  <Label htmlFor="channel-sms">SMS</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowCompose(false);
                toast({
                  title: "Notification sent",
                  description: "Your notification has been delivered"
                });
              }}>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default NotificationCenter;