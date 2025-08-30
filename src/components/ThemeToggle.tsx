import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      data-testid="theme-toggle"
      className={cn(
        "h-9 w-9 rounded-full transition-all duration-200",
        "hover:shadow-md active:scale-95",
        theme === 'dark' 
          ? "text-yellow-400 hover:bg-yellow-400/10" 
          : "text-blue-600 hover:bg-blue-600/10"
      )}
      style={{
        backgroundColor: theme === 'dark' 
          ? 'hsl(var(--surface-elevated))' 
          : 'hsl(var(--surface-elevated))',
        borderColor: 'hsl(var(--border))'
      }}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
      )}
    </Button>
  );
}