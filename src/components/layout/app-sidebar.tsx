import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown, 
  Search,
  type LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { sidebarData, type NavItem, type NavGroup } from './data/sidebar-data';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';
import { useLayout } from '@/context/layout-provider';
import { useSearch } from '@/context/search-provider';

export function AppSidebar() {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, mobileView, sidebarOpen } = useLayout();
  const { setIsOpen: setSearchOpen } = useSearch();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (url: string) => {
    if (url === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon;
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = isActive(item.url);
    

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant={active ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start transition-all hover:bg-accent/50',
                depth > 0 && 'ml-4',
                sidebarCollapsed && depth === 0 && 'justify-center',
                active && 'bg-accent text-accent-foreground font-medium'
              )}
            >
              {Icon && (
                <Icon className={cn(
                  'h-4 w-4 transition-colors',
                  !sidebarCollapsed && 'mr-2',
                  active && 'text-primary'
                )} />
              )}
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {!sidebarCollapsed && (
            <CollapsibleContent className="mt-1 space-y-1">
              {item.items.map((subItem) => renderNavItem(subItem, depth + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    const navButton = (
      <Button
        key={item.title}
        variant={active ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start transition-all hover:bg-accent/50',
          depth > 0 && 'ml-4',
          sidebarCollapsed && depth === 0 && 'justify-center px-2',
          active && 'bg-accent text-accent-foreground font-medium'
        )}
        asChild
      >
        <Link to={item.url}>
          {Icon && (
            <Icon className={cn(
              'h-4 w-4 transition-colors',
              !sidebarCollapsed && 'mr-2',
              active && 'text-primary'
            )} />
          )}
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge !== undefined && (
                <Badge 
                  variant="default" 
                  className="ml-auto h-5 px-1.5 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Link>
      </Button>
    );

    if (sidebarCollapsed && depth === 0) {
      return (
        <TooltipProvider key={item.title}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{navButton}</TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {item.title}
              {item.badge !== undefined && (
                <Badge variant="default" className="h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return navButton;
  };

  const renderNavGroup = (group: NavGroup, index: number) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    return (
      <div key={group.title} className={cn(index > 0 && 'mt-4')}>
        {!sidebarCollapsed && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mb-2 px-3 w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            {group.title}
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform",
              !isExpanded && "-rotate-90"
            )} />
          </button>
        )}
        <div className={cn(
          "space-y-1 transition-all",
          !isExpanded && !sidebarCollapsed && "hidden"
        )}>
          {group.items.map((item) => renderNavItem(item))}
        </div>
      </div>
    );
  };

  if (!sidebarOpen && mobileView) {
    return null;
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64',
        mobileView && 'shadow-2xl'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-3">
        {!sidebarCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              B
            </div>
            <span className="text-foreground">BigFootLive</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="ml-auto hover:bg-accent"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="p-3">
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-muted-foreground hover:bg-accent',
            sidebarCollapsed && 'justify-center px-2'
          )}
          onClick={() => setSearchOpen(true)}
        >
          <Search className={cn('h-4 w-4', !sidebarCollapsed && 'mr-2')} />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-left">Search...</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </>
          )}
        </Button>
      </div>

      {/* Team Switcher */}
      <div className="px-3 pb-3">
        <TeamSwitcher collapsed={sidebarCollapsed} />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="px-3 pb-8">
          {sidebarData.map((group, index) => renderNavGroup(group, index))}
        </nav>
      </ScrollArea>

      {/* User */}
      <div className="border-t border-border p-3">
        <NavUser collapsed={sidebarCollapsed} />
      </div>
      
      {/* Hide any potential debug info */}
      <style>{`
        .sidebar-debug-info, 
        [data-debug-info],
        [data-testid*="debug"],
        aside > div:last-child > div:empty,
        aside > div:last-child > span:empty,
        aside *:has-text("45d9d97e") {
          display: none !important;
        }
        
        /* Hide any text nodes at bottom */
        aside::after {
          display: none !important;
        }
        
        /* Ensure sidebar ends properly */
        aside {
          overflow: hidden !important;
        }
      `}</style>
    </aside>
  );
}