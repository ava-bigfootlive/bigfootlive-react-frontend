import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Palette,
  Video,
  Mic,
  Camera,
  Monitor,
  Wifi,
  HardDrive,
  Database,
  Key,
  Lock,
  Unlock,
  Mail,
  Smartphone,
  Languages,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Upload,
  Download,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronRight,
  ExternalLink,
  Trash2,
  Plus,
  Edit,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  UserX,
  Clock,
  Calendar,
  MapPin,
  Building,
  Phone,
  Image,
  FileText
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface UserSettings {
  profile: {
    displayName: string;
    email: string;
    avatar: string;
    bio: string;
    location: string;
    website: string;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'system';
    soundEnabled: boolean;
    autoPlayVideos: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showLocation: boolean;
    allowMessages: boolean;
    allowInvites: boolean;
    dataCollection: boolean;
  };
  streaming: {
    defaultQuality: string;
    defaultBitrate: number;
    defaultFrameRate: number;
    hardwareAcceleration: boolean;
    lowLatencyMode: boolean;
    autoRecord: boolean;
    recordingQuality: string;
    recordingFormat: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    trustedDevices: string[];
    loginAlerts: boolean;
    apiKeys: Array<{
      id: string;
      name: string;
      key: string;
      created: Date;
      lastUsed?: Date;
    }>;
  };
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      displayName: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://placehold.co/100x100',
      bio: 'Live streaming enthusiast',
      location: 'New York, NY',
      website: 'https://example.com'
    },
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      theme: 'system',
      soundEnabled: true,
      autoPlayVideos: false,
      emailNotifications: true,
      pushNotifications: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      allowMessages: true,
      allowInvites: true,
      dataCollection: true
    },
    streaming: {
      defaultQuality: '1080p',
      defaultBitrate: 4000,
      defaultFrameRate: 30,
      hardwareAcceleration: true,
      lowLatencyMode: false,
      autoRecord: true,
      recordingQuality: '1080p',
      recordingFormat: 'mp4'
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      trustedDevices: ['Chrome on Windows', 'Safari on iPhone'],
      loginAlerts: true,
      apiKeys: [
        {
          id: '1',
          name: 'Production API',
          key: 'sk_live_********************************',
          created: new Date('2024-01-01'),
          lastUsed: new Date('2024-02-20')
        }
      ]
    }
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const storageUsed = 4.2; // GB
  const storageLimit = 10; // GB
  const storagePercentage = (storageUsed / storageLimit) * 100;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' }
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  const saveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully"
      });
    }, 1500);
  };

  const generateAPIKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `sk_live_${Array.from({ length: 32 }, () => 
        Math.random().toString(36).charAt(2)
      ).join('')}`,
      created: new Date()
    };
    
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        apiKeys: [...settings.security.apiKeys, newKey]
      }
    });
    
    toast({
      title: "API Key Generated",
      description: "Your new API key has been created"
    });
  };

  const deleteAPIKey = (id: string) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        apiKeys: settings.security.apiKeys.filter(key => key.id !== id)
      }
    });
    
    toast({
      title: "API Key Deleted",
      description: "The API key has been removed"
    });
  };

  const enable2FA = () => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        twoFactorEnabled: true
      }
    });
    setShow2FADialog(false);
    
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication is now active"
    });
  };

  const changePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setShowPasswordDialog(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Main Settings */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details and public information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={settings.profile.avatar} />
                  <AvatarFallback>{settings.profile.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 400x400px, max 5MB
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={settings.profile.displayName}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, displayName: e.target.value }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, email: e.target.value }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      className="pl-9"
                      value={settings.profile.location}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, location: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      className="pl-9"
                      value={settings.profile.website}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, website: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, bio: e.target.value }
                  })}
                  rows={4}
                  placeholder="Tell viewers about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">
                    Update your account password
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                  <Key className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your account data
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                <div>
                  <p className="font-medium text-red-600">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, language: value }
                    })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, timezone: value }
                    })}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select
                    value={settings.preferences.dateFormat}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, dateFormat: value }
                    })}
                  >
                    <SelectTrigger id="date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value: any) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, theme: value }
                    })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sound Effects</Label>
                      <p className="text-xs text-muted-foreground">
                        Play sounds for notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.preferences.soundEnabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, soundEnabled: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.preferences.emailNotifications}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, emailNotifications: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.preferences.pushNotifications}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, pushNotifications: checked }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Playback</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Play Videos</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically play videos when loaded
                    </p>
                  </div>
                  <Switch
                    checked={settings.preferences.autoPlayVideos}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, autoPlayVideos: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value: any) => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, profileVisibility: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Information Display</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-xs text-muted-foreground">
                        Display email on your profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.showEmail}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showEmail: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Location</Label>
                      <p className="text-xs text-muted-foreground">
                        Display location on your profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.showLocation}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showLocation: checked }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Communication</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Direct Messages</Label>
                      <p className="text-xs text-muted-foreground">
                        Let others send you messages
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowMessages}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, allowMessages: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Event Invites</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive invitations to events
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowInvites}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, allowInvites: checked }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data & Analytics</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usage Analytics</Label>
                    <p className="text-xs text-muted-foreground">
                      Help improve the platform with anonymous data
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.dataCollection}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, dataCollection: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Streaming Defaults</CardTitle>
              <CardDescription>Default settings for your streams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Quality</Label>
                  <Select
                    value={settings.streaming.defaultQuality}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      streaming: { ...settings.streaming, defaultQuality: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4k">4K (2160p)</SelectItem>
                      <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                      <SelectItem value="720p">HD (720p)</SelectItem>
                      <SelectItem value="480p">SD (480p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Frame Rate</Label>
                  <Select
                    value={settings.streaming.defaultFrameRate.toString()}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      streaming: { ...settings.streaming, defaultFrameRate: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 fps</SelectItem>
                      <SelectItem value="30">30 fps</SelectItem>
                      <SelectItem value="60">60 fps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default Bitrate</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.streaming.defaultBitrate]}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      streaming: { ...settings.streaming, defaultBitrate: value[0] }
                    })}
                    min={1000}
                    max={10000}
                    step={500}
                    className="flex-1"
                  />
                  <span className="w-20 text-right text-sm">
                    {settings.streaming.defaultBitrate} kbps
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Performance</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hardware Acceleration</Label>
                      <p className="text-xs text-muted-foreground">
                        Use GPU for encoding when available
                      </p>
                    </div>
                    <Switch
                      checked={settings.streaming.hardwareAcceleration}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        streaming: { ...settings.streaming, hardwareAcceleration: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Latency Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Reduce stream delay for real-time interaction
                      </p>
                    </div>
                    <Switch
                      checked={settings.streaming.lowLatencyMode}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        streaming: { ...settings.streaming, lowLatencyMode: checked }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recording</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label>Auto-Record Streams</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically save your streams
                    </p>
                  </div>
                  <Switch
                    checked={settings.streaming.autoRecord}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      streaming: { ...settings.streaming, autoRecord: checked }
                    })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Recording Quality</Label>
                    <Select
                      value={settings.streaming.recordingQuality}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        streaming: { ...settings.streaming, recordingQuality: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="source">Source Quality</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Recording Format</Label>
                    <Select
                      value={settings.streaming.recordingFormat}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        streaming: { ...settings.streaming, recordingFormat: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="mkv">MKV</SelectItem>
                        <SelectItem value="flv">FLV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storage</CardTitle>
              <CardDescription>Manage your storage usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span>{storageUsed} GB / {storageLimit} GB</span>
                  </div>
                  <Progress value={storagePercentage} />
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Recordings
                    </span>
                    <span>2.8 GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Thumbnails
                    </span>
                    <span>0.5 GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Other
                    </span>
                    <span>0.9 GB</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Manage Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        {settings.security.twoFactorEnabled 
                          ? 'Enabled - Your account is protected'
                          : 'Add an extra layer of security'}
                      </p>
                    </div>
                  </div>
                  {settings.security.twoFactorEnabled ? (
                    <Badge variant="default">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Button variant="outline" onClick={() => setShow2FADialog(true)}>
                      Enable 2FA
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <Select
                    value={settings.security.sessionTimeout.toString()}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.loginAlerts}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, loginAlerts: checked }
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Trusted Devices</h3>
                  <Button variant="outline" size="sm">
                    Manage Devices
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {settings.security.trustedDevices.map((device, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{device}</span>
                      </div>
                      <Badge variant="secondary">Trusted</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowAPIKeyDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Key
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {settings.security.apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{apiKey.name}</p>
                          <p className="font-mono text-sm text-muted-foreground">
                            {apiKey.key}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Created: {apiKey.created.toLocaleDateString()}</span>
                            {apiKey.lastUsed && (
                              <span>Last used: {apiKey.lastUsed.toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteAPIKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="p-4 border rounded-lg bg-primary/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">Professional Plan</h3>
                      <Badge>Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      $29.99/month • Renews on March 1, 2024
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Unlimited streaming hours
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        4K streaming quality
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Advanced analytics
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="outline" className="w-full">Cancel</Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Methods */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Payment Methods</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Billing History */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Billing History</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">February 2024</p>
                      <p className="text-sm text-muted-foreground">Professional Plan</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">$29.99</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">January 2024</p>
                      <p className="text-sm text-muted-foreground">Professional Plan</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">$29.99</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={changePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                QR Code
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="2fa-code">Enter verification code</Label>
              <Input
                id="2fa-code"
                placeholder="000000"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>
              Cancel
            </Button>
            <Button onClick={enable2FA}>
              Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You will lose access to all your streams, recordings, and settings.
              This action is irreversible.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              Type "DELETE" to confirm
            </Label>
            <Input
              id="delete-confirm"
              placeholder="Type DELETE to confirm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive">
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;