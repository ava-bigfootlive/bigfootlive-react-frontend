import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/context/theme-provider';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Info,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemeShowcase() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const colors = [
    { name: 'Background', var: 'bg-background', border: true },
    { name: 'Foreground', var: 'bg-foreground' },
    { name: 'Card', var: 'bg-card', border: true },
    { name: 'Primary', var: 'bg-primary' },
    { name: 'Secondary', var: 'bg-secondary' },
    { name: 'Muted', var: 'bg-muted' },
    { name: 'Accent', var: 'bg-accent' },
    { name: 'Destructive', var: 'bg-destructive' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Theme Showcase</h1>
        <p className="text-muted-foreground mt-2">
          Professional admin dashboard theme with OKLCH colors
        </p>
      </div>

      {/* Theme Switcher */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Choose your preferred theme. Currently using: {resolvedTheme} mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="gap-2"
            >
              <Laptop className="h-4 w-4" />
              System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>
            OKLCH color system for perceptually uniform colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div 
                  className={cn(
                    'h-20 rounded-lg shadow-sm',
                    color.var,
                    color.border && 'border'
                  )} 
                />
                <p className="text-sm font-medium text-center">{color.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Components Showcase */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Sun className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-500">Success</Badge>
              <Badge className="bg-yellow-500">Warning</Badge>
              <Badge className="bg-blue-500">Info</Badge>
              <Badge className="bg-purple-500">Custom</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>
                This is a default alert message.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again.
              </AlertDescription>
            </Alert>
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-400">Success</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Operation completed successfully.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
            <div className="space-y-2">
              <Label>Volume</Label>
              <Slider defaultValue={[50]} max={100} step={1} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Example */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs Component</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Overview</h3>
                <p className="text-muted-foreground">
                  This is the overview tab content. The theme system provides consistent
                  styling across all components with smooth transitions between light and dark modes.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Analytics</h3>
                <p className="text-muted-foreground">
                  Analytics data would be displayed here with charts and metrics
                  that adapt to the current theme.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-muted-foreground">
                  Configuration options and preferences would be shown here,
                  maintaining visual consistency with the rest of the application.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Glass Morphism Effects */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Glass Morphism</CardTitle>
          <CardDescription>
            Modern glass effect with backdrop blur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This card demonstrates the glass morphism effect that can be applied
            to create depth and visual hierarchy in the interface. The effect
            works well in both light and dark modes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}