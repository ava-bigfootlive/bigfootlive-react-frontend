import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronUp,
  Shield,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavUserProps {
  collapsed?: boolean;
}

export function NavUser({ collapsed = false }: NavUserProps) {
  const { user, signOut } = useAuth();

  const getInitials = () => {
    if (!user) return 'U';
    if (user.given_name && user.family_name) {
      return `${user.given_name[0]}${user.family_name[0]}`.toUpperCase();
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getUserName = () => {
    if (!user) return 'User';
    
    // Check for name fields first
    if (user.given_name && user.family_name) {
      return `${user.given_name} ${user.family_name}`;
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    // If we have just one name field, use it
    if (user.given_name) {
      return user.given_name;
    }
    if (user.firstName) {
      return user.firstName;
    }
    
    // Don't use username if it's a UUID/GUID (contains dashes and is 36 chars)
    const isUUID = user.username && 
                   user.username.length === 36 && 
                   user.username.includes('-');
    
    if (!isUUID && user.username && user.username !== user.email) {
      return user.username;
    }
    
    // Use email as last resort, but extract the part before @
    if (user.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      return emailName
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    
    return 'User';
  };

  const isPlatformAdmin = user?.role === 'platform_admin' || user?.roles?.includes('platform_admin');

  const userButton = (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-2 px-2 hover:bg-accent',
          collapsed && 'justify-center'
        )}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex flex-1 flex-col items-start text-left">
              <span className="text-sm font-medium">{getUserName()}</span>
              <span className="text-xs text-muted-foreground">
                {user?.email || 'user@bigfootlive.io'}
              </span>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </>
        )}
      </Button>
    </DropdownMenuTrigger>
  );

  const dropdownContent = (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{getUserName()}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user?.email}
          </p>
          {isPlatformAdmin && (
            <p className="text-xs leading-none text-primary font-medium mt-1">
              Platform Administrator
            </p>
          )}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      <DropdownMenuItem asChild>
        <Link to="/user-management" className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem asChild>
        <Link to="/notifications" className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem asChild>
        <Link to="/settings" className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </Link>
      </DropdownMenuItem>
      
      {isPlatformAdmin && (
        <DropdownMenuItem asChild>
          <Link to="/platform-admin" className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            <span>Platform Admin</span>
          </Link>
        </DropdownMenuItem>
      )}
      
      <DropdownMenuItem asChild>
        <Link to="/help" className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem 
        onClick={signOut}
        className="cursor-pointer text-destructive focus:text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Sign out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <DropdownMenu>
            <TooltipTrigger asChild>
              {userButton}
            </TooltipTrigger>
            {dropdownContent}
          </DropdownMenu>
          <TooltipContent side="right">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{getUserName()}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      {userButton}
      {dropdownContent}
    </DropdownMenu>
  );
}