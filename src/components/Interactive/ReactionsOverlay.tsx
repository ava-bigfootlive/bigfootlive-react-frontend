import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ThumbsUp,
  Smile,
  Laugh,
  Star,
  Flame,
  PartyPopper,
  Sparkles,
  Trophy,
  Rocket,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Reaction {
  id: string;
  type: string;
  emoji: string;
  icon?: React.ReactNode;
  color: string;
  userId: string;
  username: string;
  timestamp: Date;
  x?: number;
  y?: number;
  size?: 'small' | 'medium' | 'large';
  animation?: 'float' | 'burst' | 'spiral' | 'wave';
}

interface ReactionType {
  id: string;
  name: string;
  emoji: string;
  icon: React.ReactNode;
  color: string;
  animation: 'float' | 'burst' | 'spiral' | 'wave';
  cooldown?: number;
  cost?: number;
}

interface ReactionStats {
  type: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface ReactionsOverlayProps {
  eventId: string;
  userId: string;
  username: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  maxReactions?: number;
  showStats?: boolean;
  allowCustomReactions?: boolean;
  className?: string;
}

const defaultReactionTypes: ReactionType[] = [
  { id: 'heart', name: 'Love', emoji: '❤️', icon: <Heart className="h-5 w-5" />, color: '#ef4444', animation: 'float' },
  { id: 'like', name: 'Like', emoji: '👍', icon: <ThumbsUp className="h-5 w-5" />, color: '#3b82f6', animation: 'float' },
  { id: 'smile', name: 'Happy', emoji: '😊', icon: <Smile className="h-5 w-5" />, color: '#eab308', animation: 'burst' },
  { id: 'laugh', name: 'Funny', emoji: '😂', icon: <Laugh className="h-5 w-5" />, color: '#f97316', animation: 'spiral' },
  { id: 'star', name: 'Amazing', emoji: '⭐', icon: <Star className="h-5 w-5" />, color: '#fbbf24', animation: 'burst' },
  { id: 'fire', name: 'Fire', emoji: '🔥', icon: <Flame className="h-5 w-5" />, color: '#dc2626', animation: 'wave' },
  { id: 'party', name: 'Celebrate', emoji: '🎉', icon: <PartyPopper className="h-5 w-5" />, color: '#a855f7', animation: 'burst', cooldown: 5000 },
  { id: 'sparkle', name: 'Magic', emoji: '✨', icon: <Sparkles className="h-5 w-5" />, color: '#ec4899', animation: 'spiral', cooldown: 3000 },
  { id: 'trophy', name: 'Winner', emoji: '🏆', icon: <Trophy className="h-5 w-5" />, color: '#facc15', animation: 'burst', cost: 5 },
  { id: 'rocket', name: 'Boost', emoji: '🚀', icon: <Rocket className="h-5 w-5" />, color: '#6366f1', animation: 'wave', cost: 10 },
];

const ReactionsOverlay: React.FC<ReactionsOverlayProps> = ({
  eventId,
  userId,
  username,
  position = 'bottom-right',
  maxReactions = 50,
  showStats = true,
  allowCustomReactions = false,
  className
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactionTypes, setReactionTypes] = useState<ReactionType[]>(defaultReactionTypes);
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionCooldowns, setReactionCooldowns] = useState<Record<string, number>>({});
  const [reactionStats, setReactionStats] = useState<ReactionStats[]>([]);
  const [totalReactions, setTotalReactions] = useState(0);
  const [reactionHistory, setReactionHistory] = useState<Reaction[]>([]);
  const [burstMode, setBurstMode] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [lastReactionType, setLastReactionType] = useState<string | null>(null);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [userPoints, setUserPoints] = useState(100);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const cooldownTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      query: { eventId, userId }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to reactions server');
    });

    socketInstance.on('reaction', (reaction: Reaction) => {
      addReaction(reaction);
    });

    socketInstance.on('reactionBurst', (data: { reactions: Reaction[] }) => {
      data.reactions.forEach((reaction, index) => {
        setTimeout(() => addReaction(reaction), index * 50);
      });
    });

    socketInstance.on('reactionStats', (stats: ReactionStats[]) => {
      setReactionStats(stats);
    });

    socketInstance.on('customReactions', (customTypes: ReactionType[]) => {
      setReactionTypes([...defaultReactionTypes, ...customTypes]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [eventId, userId]);

  // Clean up old reactions
  useEffect(() => {
    const interval = setInterval(() => {
      setReactions(prev => {
        const now = Date.now();
        return prev.filter(r => now - new Date(r.timestamp).getTime() < 5000);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addReaction = useCallback((reaction: Reaction) => {
    const enhancedReaction = {
      ...reaction,
      x: reaction.x || Math.random() * 100,
      y: reaction.y || 100,
      size: reaction.size || 'medium',
      animation: reaction.animation || 'float'
    };

    setReactions(prev => {
      const newReactions = [...prev, enhancedReaction];
      // Keep only the latest maxReactions
      return newReactions.slice(-maxReactions);
    });

    setReactionHistory(prev => [...prev, enhancedReaction].slice(-100));
    setTotalReactions(prev => prev + 1);

    // Update stats
    updateReactionStats(reaction.type);

    // Check for combo
    if (reaction.userId === userId) {
      checkCombo(reaction.type);
    }
  }, [maxReactions, userId]);

  const updateReactionStats = useCallback((type: string) => {
    setReactionStats(prev => {
      const existing = prev.find(s => s.type === type);
      if (existing) {
        return prev.map(s => 
          s.type === type 
            ? { ...s, count: s.count + 1, trend: 'up' }
            : s
        );
      } else {
        return [...prev, { type, count: 1, percentage: 0, trend: 'up' }];
      }
    });
  }, []);

  const checkCombo = useCallback((type: string) => {
    if (lastReactionType === type) {
      setComboCount(prev => prev + 1);
      
      // Trigger burst mode on combo
      if (comboCount >= 5) {
        setBurstMode(true);
        setTimeout(() => setBurstMode(false), 3000);
      }
    } else {
      setComboCount(1);
    }
    
    setLastReactionType(type);

    // Reset combo after timeout
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    comboTimeoutRef.current = setTimeout(() => {
      setComboCount(0);
      setLastReactionType(null);
    }, 2000);
  }, [lastReactionType, comboCount]);

  const sendReaction = useCallback((reactionType: ReactionType) => {
    if (!socket) return;

    // Check cooldown
    if (reactionCooldowns[reactionType.id]) {
      return;
    }

    // Check cost
    if (reactionType.cost && userPoints < reactionType.cost) {
      alert('Not enough points!');
      return;
    }

    const reaction: Partial<Reaction> = {
      type: reactionType.id,
      emoji: reactionType.emoji,
      userId,
      username,
      timestamp: new Date(),
      animation: burstMode ? 'burst' : reactionType.animation,
      size: burstMode ? 'large' : 'medium'
    };

    socket.emit('sendReaction', reaction);

    // Deduct points if needed
    if (reactionType.cost) {
      setUserPoints(prev => prev - reactionType.cost!);
    }

    // Set cooldown
    if (reactionType.cooldown) {
      setReactionCooldowns(prev => ({ ...prev, [reactionType.id]: reactionType.cooldown! }));
      
      const timer = setInterval(() => {
        setReactionCooldowns(prev => {
          const current = prev[reactionType.id] || 0;
          if (current <= 100) {
            clearInterval(timer);
            const { [reactionType.id]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [reactionType.id]: current - 100 };
        });
      }, 100);

      cooldownTimersRef.current[reactionType.id] = timer;
    }

    // Local feedback
    addReaction({
      id: `local-${Date.now()}`,
      ...reaction as Reaction
    });

    setShowReactionPicker(false);
  }, [socket, userId, username, reactionCooldowns, userPoints, burstMode, addReaction]);

  const sendBurstReaction = useCallback((reactionType: ReactionType, count: number = 10) => {
    if (!socket) return;

    const reactions = Array.from({ length: count }, (_, i) => ({
      type: reactionType.id,
      emoji: reactionType.emoji,
      userId,
      username,
      timestamp: new Date(),
      x: 30 + Math.random() * 40,
      y: 100,
      animation: 'burst' as const,
      size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large'
    }));

    socket.emit('sendBurstReaction', { reactions });
  }, [socket, userId, username]);

  const getAnimationVariants = (animation: string) => {
    switch (animation) {
      case 'float':
        return {
          initial: { y: 0, opacity: 1, scale: 0 },
          animate: { 
            y: -200, 
            opacity: [1, 1, 0],
            scale: [0, 1, 1],
            x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30]
          },
          exit: { opacity: 0 }
        };
      
      case 'burst':
        return {
          initial: { scale: 0, opacity: 1 },
          animate: { 
            scale: [0, 1.5, 1],
            opacity: [1, 1, 0],
            rotate: Math.random() * 360,
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100
          },
          exit: { scale: 0, opacity: 0 }
        };
      
      case 'spiral':
        return {
          initial: { scale: 0, rotate: 0, opacity: 1 },
          animate: { 
            scale: [0, 1, 1, 0],
            rotate: 720,
            opacity: [1, 1, 0],
            x: Math.sin(Date.now() / 100) * 100,
            y: -200
          },
          exit: { opacity: 0 }
        };
      
      case 'wave':
        return {
          initial: { x: -50, opacity: 0 },
          animate: { 
            x: [- 50, 0, 50],
            opacity: [0, 1, 0],
            y: [0, -100, -200],
            scale: [0.5, 1, 0.5]
          },
          exit: { x: 100, opacity: 0 }
        };
      
      default:
        return {
          initial: { y: 0, opacity: 1 },
          animate: { y: -200, opacity: 0 },
          exit: { opacity: 0 }
        };
    }
  };

  const getReactionSize = (size: string) => {
    switch (size) {
      case 'small': return 'text-2xl';
      case 'large': return 'text-5xl';
      default: return 'text-3xl';
    }
  };

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  return (
    <TooltipProvider>
      <div className={cn("fixed z-50", positionClasses[position], className)}>
        {/* Reaction Animations Overlay */}
        <div 
          ref={overlayRef}
          className="fixed inset-0 pointer-events-none overflow-hidden"
        >
          <AnimatePresence>
            {reactions.map((reaction) => (
              <motion.div
                key={reaction.id}
                className={cn(
                  "absolute pointer-events-none",
                  getReactionSize(reaction.size || 'medium')
                )}
                style={{
                  left: `${reaction.x}%`,
                  bottom: `${reaction.y}px`,
                  color: reactionTypes.find(t => t.id === reaction.type)?.color
                }}
                variants={getAnimationVariants(reaction.animation || 'float')}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <span className="drop-shadow-lg">
                  {reaction.emoji}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Combo Indicator */}
        <AnimatePresence>
          {comboCount > 1 && (
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -20 }}
              className="absolute -top-16 left-1/2 transform -translate-x-1/2"
            >
              <Badge variant="default" className="text-lg px-3 py-1">
                <Flame className="h-4 w-4 mr-1" />
                {comboCount}x Combo!
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Burst Mode Indicator */}
        <AnimatePresence>
          {burstMode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.1, 1] }}
              exit={{ scale: 0 }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="absolute -top-24 left-1/2 transform -translate-x-1/2"
            >
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Sparkles className="h-4 w-4 mr-1 animate-spin" />
                BURST MODE
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Panel */}
        <div className="flex items-center gap-2">
          {/* Quick Reactions */}
          <div className="flex items-center gap-1 bg-background/95 backdrop-blur rounded-full p-1 border shadow-lg">
            {reactionTypes.slice(0, 5).map((type) => (
              <Tooltip key={type.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full relative",
                      reactionCooldowns[type.id] && "opacity-50"
                    )}
                    onClick={() => sendReaction(type)}
                    disabled={!!reactionCooldowns[type.id]}
                  >
                    <span className="text-xl">{type.emoji}</span>
                    
                    {/* Cooldown Overlay */}
                    {reactionCooldowns[type.id] && (
                      <div className="absolute inset-0 rounded-full">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${(1 - reactionCooldowns[type.id] / (type.cooldown || 1000)) * 100} 100`}
                            className="text-primary opacity-50"
                          />
                        </svg>
                      </div>
                    )}
                    
                    {/* Cost Badge */}
                    {type.cost && (
                      <Badge className="absolute -top-1 -right-1 h-4 px-1 text-xs">
                        {type.cost}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{type.name}</p>
                  {type.cooldown && (
                    <p className="text-xs text-muted-foreground">
                      Cooldown: {type.cooldown / 1000}s
                    </p>
                  )}
                  {type.cost && (
                    <p className="text-xs text-muted-foreground">
                      Cost: {type.cost} points
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
            
            {/* More Reactions */}
            <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Reactions</h4>
                    <Badge variant="outline">
                      {userPoints} points
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {reactionTypes.map((type) => (
                      <Tooltip key={type.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "rounded-lg",
                              reactionCooldowns[type.id] && "opacity-50"
                            )}
                            onClick={() => sendReaction(type)}
                            disabled={
                              !!reactionCooldowns[type.id] ||
                              (type.cost ? userPoints < type.cost : false)
                            }
                          >
                            <span className="text-2xl">{type.emoji}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{type.name}</p>
                          {type.cost && <p className="text-xs">Cost: {type.cost}</p>}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>

                  {/* Burst Actions */}
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm font-medium">Special Actions</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendBurstReaction(reactionTypes[0], 20)}
                        disabled={userPoints < 50}
                      >
                        <PartyPopper className="h-4 w-4 mr-1" />
                        Reaction Burst (50pts)
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Stats Button */}
          {showStats && (
            <Popover open={showStatsPanel} onOpenChange={setShowStatsPanel}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96" align="end">
                <Tabs defaultValue="live">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="live">Live Stats</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="live" className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Total Reactions</span>
                        <Badge>{totalReactions.toLocaleString()}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {reactionStats
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 5)
                          .map((stat) => {
                            const type = reactionTypes.find(t => t.id === stat.type);
                            const percentage = totalReactions > 0 
                              ? (stat.count / totalReactions) * 100 
                              : 0;
                            
                            return (
                              <div key={stat.type} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>{type?.emoji}</span>
                                    <span>{type?.name}</span>
                                  </div>
                                  <span className="text-muted-foreground">
                                    {stat.count} ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <Progress value={percentage} className="h-2" />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {reactionHistory
                          .slice()
                          .reverse()
                          .slice(0, 20)
                          .map((reaction, index) => (
                            <div
                              key={`${reaction.id}-${index}`}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span>{reaction.emoji}</span>
                                <span className="text-muted-foreground">
                                  {reaction.username}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reaction.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ReactionsOverlay;