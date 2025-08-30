import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TeamSwitcherProps {
  collapsed?: boolean;
}

interface Team {
  id: string;
  name: string;
  logo?: string;
  plan: 'free' | 'pro' | 'enterprise';
}

// Teams will be loaded from API/tenant info

export function TeamSwitcher({ collapsed = false }: TeamSwitcherProps) {
  const { user, tenant } = useAuth();
  
  // Get actual tenant information from user email domain or use user email
  const userDomain = user?.email ? user.email.split('@')[1] : null;
  const displayName = userDomain ? userDomain.split('.')[0].charAt(0).toUpperCase() + userDomain.split('.')[0].slice(1) : 
                     (user?.email ? user.email.split('@')[0] : 'User');
  
  const currentTeam: Team = {
    id: tenant || user?.email?.split('@')[0] || 'user',
    name: displayName,
    plan: 'enterprise', // TODO: Get from tenant metadata/API
  };
  
  const [selectedTeam, setSelectedTeam] = useState<Team>(currentTeam);

  const getTeamInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanBadgeColor = (plan: Team['plan']) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-primary text-primary-foreground';
      case 'pro':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Just show the current tenant without dropdown
  const teamDisplay = (
    <div
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 rounded-md bg-accent/50',
        collapsed && 'justify-center px-2'
      )}
    >
      <Avatar className="h-6 w-6">
        <AvatarImage 
          src={selectedTeam.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedTeam.name}`} 
        />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {getTeamInitials(selectedTeam.name)}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex flex-1 flex-col items-start text-left">
          <span className="text-sm font-medium truncate max-w-[140px]">
            {selectedTeam.name}
          </span>
          <span className={cn(
            'text-xs px-1 rounded',
            getPlanBadgeColor(selectedTeam.plan)
          )}>
            {selectedTeam.plan}
          </span>
        </div>
      )}
    </div>
  );


  // Just display the current tenant, no dropdown needed
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {teamDisplay}
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{selectedTeam.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{selectedTeam.plan} plan</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return teamDisplay;
}