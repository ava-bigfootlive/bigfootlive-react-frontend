import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeTest() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Theme Toggle Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Theme System Test</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="relative"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Current Theme Display */}
        <Card>
          <CardHeader>
            <CardTitle>Current Theme</CardTitle>
            <CardDescription>
              The current theme is: <span className="font-semibold">{theme}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              CSS variables are being applied from the {theme} mode configuration.
            </p>
          </CardContent>
        </Card>

        {/* Switch Component Test */}
        <Card>
          <CardHeader>
            <CardTitle>Switch Component</CardTitle>
            <CardDescription>Test the switch toggle with proper theming</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="test-switch-1" />
              <Label htmlFor="test-switch-1">Default Switch</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="test-switch-2" defaultChecked />
              <Label htmlFor="test-switch-2">Checked Switch</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="test-switch-3" disabled />
              <Label htmlFor="test-switch-3">Disabled Switch</Label>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>With proper background contrast</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card should have visible borders and proper background color based on the theme.</p>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Primary Border Card</CardTitle>
              <CardDescription>Custom border color</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has a primary color border.</p>
            </CardContent>
          </Card>
        </div>

        {/* Form Elements Test */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Various form components with theming</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">Input Field</Label>
              <Input id="test-input" placeholder="Type something..." />
            </div>
            
            <div className="flex gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Test */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>All theme colors from CSS variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-20 rounded bg-background border" />
                <p className="text-sm mt-1">Background</p>
              </div>
              <div>
                <div className="h-20 rounded bg-foreground" />
                <p className="text-sm mt-1">Foreground</p>
              </div>
              <div>
                <div className="h-20 rounded bg-card border" />
                <p className="text-sm mt-1">Card</p>
              </div>
              <div>
                <div className="h-20 rounded bg-primary" />
                <p className="text-sm mt-1">Primary</p>
              </div>
              <div>
                <div className="h-20 rounded bg-secondary" />
                <p className="text-sm mt-1">Secondary</p>
              </div>
              <div>
                <div className="h-20 rounded bg-muted" />
                <p className="text-sm mt-1">Muted</p>
              </div>
              <div>
                <div className="h-20 rounded bg-accent" />
                <p className="text-sm mt-1">Accent</p>
              </div>
              <div>
                <div className="h-20 rounded bg-destructive" />
                <p className="text-sm mt-1">Destructive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}