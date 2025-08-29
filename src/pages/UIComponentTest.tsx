import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function UIComponentTest() {
  const { theme, toggleTheme } = useTheme();
  const [switchStates, setSwitchStates] = useState({
    notifications: true,
    autoPlay: false,
    darkMode: theme === 'dark',
    emailAlerts: true,
    pushNotifications: false,
  });

  const handleSwitchChange = (key: keyof typeof switchStates) => {
    setSwitchStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    if (key === 'darkMode') {
      toggleTheme();
    }
  };

  return (
    <DashboardLayout
      title="UI Component Test"
      subtitle="Testing Switch and Card component visibility"
    >
      <div className="space-y-6">
        {/* Theme Toggle Card */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>
              Test the theme toggle and see how components look in different modes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <Switch
                id="dark-mode"
                checked={switchStates.darkMode}
                onCheckedChange={() => handleSwitchChange('darkMode')}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Current theme: {theme}
            </p>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch
                id="notifications"
                checked={switchStates.notifications}
                onCheckedChange={() => handleSwitchChange('notifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email-alerts">Email Alerts</Label>
              <Switch
                id="email-alerts"
                checked={switchStates.emailAlerts}
                onCheckedChange={() => handleSwitchChange('emailAlerts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={switchStates.pushNotifications}
                onCheckedChange={() => handleSwitchChange('pushNotifications')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Playback Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Playback Settings</CardTitle>
            <CardDescription>
              Control video playback behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-play">Auto-play Videos</Label>
              <Switch
                id="auto-play"
                checked={switchStates.autoPlay}
                onCheckedChange={() => handleSwitchChange('autoPlay')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Switch States Display */}
        <Card>
          <CardHeader>
            <CardTitle>Current Switch States</CardTitle>
            <CardDescription>
              Debug view of all switch states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(switchStates, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => setSwitchStates(prev => ({
                notifications: !prev.notifications,
                autoPlay: !prev.autoPlay,
                darkMode: !prev.darkMode,
                emailAlerts: !prev.emailAlerts,
                pushNotifications: !prev.pushNotifications
              }))}>
                Toggle All Switches
              </Button>
              <Button variant="outline" onClick={() => setSwitchStates({
                notifications: true,
                autoPlay: false,
                darkMode: theme === 'dark',
                emailAlerts: true,
                pushNotifications: false,
              })}>
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}