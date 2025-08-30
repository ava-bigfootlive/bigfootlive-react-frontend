import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Laptop,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLayout } from '@/context/layout-provider';
import { useSearch } from '@/context/search-provider';
import { useTheme } from '@/context/theme-provider';
import { getBreadcrumbs } from './data/sidebar-data';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  const { mobileView, setSidebarOpen, sidebarOpen } = useLayout();
  const { setIsOpen: setSearchOpen } = useSearch();
  const { theme, setTheme } = useTheme();
  
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        {mobileView && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.title} className="flex items-center gap-2">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === 0 ? (
                    <BreadcrumbLink asChild className="flex items-center gap-1">
                      <Link to="/dashboard">
                        <Home className="h-3 w-3" />
                        <span className="sr-only">Home</span>
                      </Link>
                    </BreadcrumbLink>
                  ) : index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.url!}>{crumb.title}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            3
          </Badge>
        </Button>
      </div>
    </header>
  );
}