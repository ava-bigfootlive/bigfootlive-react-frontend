import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Heart,
  Star,
  Diamond,
  Crown,
  Sparkles,
  Trophy,
  Zap,
  Coffee,
  Pizza,
  Cake,
  Music,
  Camera,
  Rocket,
  Gem,
  Medal,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  CreditCard,
  Filter,
  Search,
  ChevronRight,
  Award,
  Users,
  Clock,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface VirtualGift {
  id: string;
  name: string;
  icon: React.ReactNode;
  emoji: string;
  category: 'basic' | 'premium' | 'exclusive' | 'seasonal';
  price: number;
  animation: 'float' | 'bounce' | 'spin' | 'pulse' | 'explode';
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  sound?: string;
  duration?: number;
  stackable?: boolean;
  limited?: boolean;
  stock?: number;
  description?: string;
}

interface GiftTransaction {
  id: string;
  giftId: string;
  giftName: string;
  giftEmoji: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatar?: string;
  toUserId?: string;
  toUsername?: string;
  message?: string;
  amount: number;
  totalValue: number;
  timestamp: Date;
  isAnonymous?: boolean;
}

interface GiftLeaderboard {
  userId: string;
  username: string;
  avatar?: string;
  totalGiftsReceived: number;
  totalValue: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
  topGift?: string;
}

interface UserBalance {
  coins: number;
  gems: number;
  level: number;
  nextLevelProgress: number;
  totalSpent: number;
  totalReceived: number;
}

interface VirtualGiftsProps {
  eventId: string;
  userId: string;
  username: string;
  targetUserId?: string;
  targetUsername?: string;
  isHost?: boolean;
  className?: string;
  onGiftSent?: (transaction: GiftTransaction) => void;
}

const defaultGifts: VirtualGift[] = [
  // Basic Gifts
  { id: 'heart', name: 'Heart', icon: <Heart className="h-5 w-5" />, emoji: '❤️', category: 'basic', price: 10, animation: 'float', color: '#ef4444', rarity: 'common' },
  { id: 'star', name: 'Star', icon: <Star className="h-5 w-5" />, emoji: '⭐', category: 'basic', price: 20, animation: 'spin', color: '#fbbf24', rarity: 'common' },
  { id: 'coffee', name: 'Coffee', icon: <Coffee className="h-5 w-5" />, emoji: '☕', category: 'basic', price: 30, animation: 'bounce', color: '#8b4513', rarity: 'common', stackable: true },
  { id: 'pizza', name: 'Pizza', icon: <Pizza className="h-5 w-5" />, emoji: '🍕', category: 'basic', price: 40, animation: 'bounce', color: '#f97316', rarity: 'common', stackable: true },
  { id: 'cake', name: 'Cake', icon: <Cake className="h-5 w-5" />, emoji: '🎂', category: 'basic', price: 50, animation: 'pulse', color: '#ec4899', rarity: 'common' },
  
  // Premium Gifts
  { id: 'gem', name: 'Gem', icon: <Gem className="h-5 w-5" />, emoji: '💎', category: 'premium', price: 100, animation: 'spin', color: '#3b82f6', rarity: 'rare' },
  { id: 'trophy', name: 'Trophy', icon: <Trophy className="h-5 w-5" />, emoji: '🏆', category: 'premium', price: 200, animation: 'bounce', color: '#facc15', rarity: 'rare' },
  { id: 'crown', name: 'Crown', icon: <Crown className="h-5 w-5" />, emoji: '👑', category: 'premium', price: 300, animation: 'pulse', color: '#fbbf24', rarity: 'epic' },
  { id: 'rocket', name: 'Rocket', icon: <Rocket className="h-5 w-5" />, emoji: '🚀', category: 'premium', price: 500, animation: 'explode', color: '#6366f1', rarity: 'epic' },
  
  // Exclusive Gifts
  { id: 'diamond', name: 'Diamond', icon: <Diamond className="h-5 w-5" />, emoji: '💠', category: 'exclusive', price: 1000, animation: 'spin', color: '#06b6d4', rarity: 'legendary', limited: true, stock: 10 },
  { id: 'medal', name: 'Gold Medal', icon: <Medal className="h-5 w-5" />, emoji: '🏅', category: 'exclusive', price: 750, animation: 'bounce', color: '#fbbf24', rarity: 'legendary', limited: true, stock: 20 },
  
  // Seasonal Gifts
  { id: 'sparkles', name: 'Sparkles', icon: <Sparkles className="h-5 w-5" />, emoji: '✨', category: 'seasonal', price: 150, animation: 'float', color: '#a855f7', rarity: 'rare', duration: 7 },
];

const VirtualGifts: React.FC<VirtualGiftsProps> = ({
  eventId,
  userId,
  username,
  targetUserId,
  targetUsername,
  isHost = false,
  className,
  onGiftSent
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gifts, setGifts] = useState<VirtualGift[]>(defaultGifts);
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [giftAmount, setGiftAmount] = useState(1);
  const [giftMessage, setGiftMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [transactions, setTransactions] = useState<GiftTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<GiftLeaderboard[]>([]);
  const [userBalance, setUserBalance] = useState<UserBalance>({
    coins: 1000,
    gems: 50,
    level: 1,
    nextLevelProgress: 0,
    totalSpent: 0,
    totalReceived: 0
  });
  const [activeAnimations, setActiveAnimations] = useState<GiftTransaction[]>([]);
  const [showGiftCatalog, setShowGiftCatalog] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | VirtualGift['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'popularity'>('price');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<Partial<GiftTransaction> | null>(null);
  const [giftGoal, setGiftGoal] = useState<{ target: number; current: number } | null>(null);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastGiftTime, setLastGiftTime] = useState<Date | null>(null);

  const animationContainerRef = useRef<HTMLDivElement>(null);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      query: { eventId, userId }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to gifts server');
      socketInstance.emit('getGifts');
      socketInstance.emit('getBalance');
      socketInstance.emit('getLeaderboard');
      socketInstance.emit('getGiftGoal');
    });

    socketInstance.on('gifts', (data: VirtualGift[]) => {
      setGifts([...defaultGifts, ...data]);
    });

    socketInstance.on('balance', (balance: UserBalance) => {
      setUserBalance(balance);
    });

    socketInstance.on('giftTransaction', (transaction: GiftTransaction) => {
      handleIncomingGift(transaction);
      setTransactions(prev => [transaction, ...prev].slice(0, 100));
      
      if (onGiftSent) {
        onGiftSent(transaction);
      }
    });

    socketInstance.on('leaderboard', (data: GiftLeaderboard[]) => {
      setLeaderboard(data);
    });

    socketInstance.on('giftGoal', (goal: { target: number; current: number }) => {
      setGiftGoal(goal);
    });

    socketInstance.on('comboBonus', (multiplier: number) => {
      setComboMultiplier(multiplier);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [eventId, userId, onGiftSent]);

  // Handle incoming gift animations
  const handleIncomingGift = useCallback((transaction: GiftTransaction) => {
    setActiveAnimations(prev => [...prev, transaction]);
    
    // Remove animation after duration
    setTimeout(() => {
      setActiveAnimations(prev => prev.filter(t => t.id !== transaction.id));
    }, 5000);

    // Update balance if receiving
    if (transaction.toUserId === userId) {
      setUserBalance(prev => ({
        ...prev,
        totalReceived: prev.totalReceived + transaction.totalValue
      }));
    }

    // Check for combo
    if (transaction.fromUserId === userId) {
      checkCombo();
    }
  }, [userId]);

  // Check for combo multiplier
  const checkCombo = useCallback(() => {
    if (lastGiftTime) {
      const timeDiff = Date.now() - lastGiftTime.getTime();
      if (timeDiff < 5000) {
        setComboMultiplier(prev => Math.min(prev + 0.5, 5));
        
        if (comboTimeoutRef.current) {
          clearTimeout(comboTimeoutRef.current);
        }
        
        comboTimeoutRef.current = setTimeout(() => {
          setComboMultiplier(1);
        }, 5000);
      }
    }
    
    setLastGiftTime(new Date());
  }, [lastGiftTime]);

  // Send gift
  const sendGift = useCallback(() => {
    if (!socket || !selectedGift) return;

    const totalCost = selectedGift.price * giftAmount * comboMultiplier;
    
    if (totalCost > userBalance.coins) {
      alert('Insufficient balance!');
      return;
    }

    const transaction: Partial<GiftTransaction> = {
      giftId: selectedGift.id,
      giftName: selectedGift.name,
      giftEmoji: selectedGift.emoji,
      toUserId: targetUserId,
      toUsername: targetUsername,
      message: giftMessage,
      amount: giftAmount,
      totalValue: totalCost,
      isAnonymous,
      timestamp: new Date()
    };

    setPendingTransaction(transaction);
    setShowConfirmation(true);
  }, [socket, selectedGift, giftAmount, giftMessage, isAnonymous, targetUserId, targetUsername, userBalance.coins, comboMultiplier]);

  // Confirm gift transaction
  const confirmGiftTransaction = useCallback(() => {
    if (!socket || !pendingTransaction) return;

    socket.emit('sendGift', pendingTransaction);
    
    // Update local balance
    setUserBalance(prev => ({
      ...prev,
      coins: prev.coins - (pendingTransaction.totalValue || 0),
      totalSpent: prev.totalSpent + (pendingTransaction.totalValue || 0),
      nextLevelProgress: Math.min(100, prev.nextLevelProgress + (pendingTransaction.totalValue || 0) / 10)
    }));

    // Reset form
    setSelectedGift(null);
    setGiftAmount(1);
    setGiftMessage('');
    setIsAnonymous(false);
    setShowConfirmation(false);
    setPendingTransaction(null);
    setShowGiftCatalog(false);
  }, [socket, pendingTransaction]);

  // Purchase coins
  const purchaseCoins = useCallback((amount: number) => {
    // Implement payment integration
    console.log('Purchasing coins:', amount);
    // For demo, just add coins
    setUserBalance(prev => ({ ...prev, coins: prev.coins + amount }));
  }, []);

  // Filter and sort gifts
  const filteredGifts = gifts
    .filter(gift => {
      if (filterCategory !== 'all' && gift.category !== filterCategory) return false;
      if (searchQuery && !gift.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'popularity':
          // Sort by usage in transactions
          const aCount = transactions.filter(t => t.giftId === a.id).length;
          const bCount = transactions.filter(t => t.giftId === b.id).length;
          return bCount - aCount;
        default:
          return 0;
      }
    });

  // Get animation style
  const getAnimationStyle = (animation: string) => {
    switch (animation) {
      case 'float':
        return {
          initial: { y: 100, opacity: 0, scale: 0 },
          animate: { 
            y: -200, 
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.8],
            x: [0, 50, -30, 0]
          },
          exit: { opacity: 0 },
          transition: { duration: 4, ease: "easeOut" as any }
        };
      
      case 'bounce':
        return {
          initial: { y: -100, opacity: 0 },
          animate: { 
            y: [- 100, 0, -20, 0],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1, 1],
          },
          exit: { scale: 0, opacity: 0 },
          transition: { duration: 3, type: "spring" as any, stiffness: 100 }
        };
      
      case 'spin':
        return {
          initial: { rotate: 0, scale: 0, opacity: 0 },
          animate: { 
            rotate: [0, 360, 720],
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0]
          },
          exit: { opacity: 0 },
          transition: { duration: 3 }
        };
      
      case 'pulse':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { 
            scale: [0, 1.5, 1, 1.5, 0],
            opacity: [0, 1, 1, 1, 0]
          },
          exit: { opacity: 0 },
          transition: { duration: 3, times: [0, 0.2, 0.5, 0.8, 1] }
        };
      
      case 'explode':
        return {
          initial: { scale: 0, opacity: 1 },
          animate: { 
            scale: [0, 2, 3],
            opacity: [1, 1, 0],
            rotate: [0, 180, 360]
          },
          exit: { opacity: 0 },
          transition: { duration: 2 }
        };
      
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const getRarityColor = (rarity: VirtualGift['rarity']) => {
    switch (rarity) {
      case 'rare': return 'text-blue-500 bg-blue-500/10';
      case 'epic': return 'text-purple-500 bg-purple-500/10';
      case 'legendary': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("relative", className)}>
        {/* Gift Animations Overlay */}
        <div 
          ref={animationContainerRef}
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        >
          <AnimatePresence>
            {activeAnimations.map((transaction) => {
              const gift = gifts.find(g => g.id === transaction.giftId);
              if (!gift) return null;

              return (
                <motion.div
                  key={transaction.id}
                  className="absolute left-1/2 bottom-1/4 transform -translate-x-1/2"
                  {...getAnimationStyle(gift.animation)}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className="text-6xl drop-shadow-2xl"
                      style={{ color: gift.color }}
                    >
                      {gift.emoji}
                    </div>
                    {transaction.amount > 1 && (
                      <Badge className="mt-2 text-lg px-2 py-1">
                        x{transaction.amount}
                      </Badge>
                    )}
                    {transaction.message && (
                      <div className="mt-2 bg-black/80 text-white px-3 py-1 rounded-full text-sm max-w-xs">
                        {transaction.message}
                      </div>
                    )}
                    <div className="mt-1 text-sm font-semibold text-white drop-shadow">
                      {transaction.isAnonymous ? 'Anonymous' : transaction.fromUsername}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Combo Multiplier Indicator */}
        <AnimatePresence>
          {comboMultiplier > 1 && (
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -20 }}
              className="fixed top-20 right-4 z-50"
            >
              <Badge className="text-lg px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Zap className="h-4 w-4 mr-1" />
                {comboMultiplier}x Combo!
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Gift Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowGiftCatalog(true)}
            className="gap-2"
          >
            <Gift className="h-4 w-4" />
            Send Gift
            {targetUsername && (
              <span className="text-muted-foreground">to {targetUsername}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLeaderboard(true)}
          >
            <Trophy className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>

        {/* Gift Catalog Dialog */}
        <Dialog open={showGiftCatalog} onOpenChange={setShowGiftCatalog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Send a Virtual Gift</DialogTitle>
              <DialogDescription>
                Choose a gift to show your support
                {targetUsername && ` to ${targetUsername}`}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="catalog" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="catalog">Catalog</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="balance">Balance</TabsTrigger>
              </TabsList>

              <TabsContent value="catalog" className="space-y-4">
                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search gifts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gift Grid */}
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-4 gap-4">
                    {filteredGifts.map((gift) => (
                      <Card
                        key={gift.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-lg",
                          selectedGift?.id === gift.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedGift(gift)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-2">{gift.emoji}</div>
                          <p className="font-semibold text-sm">{gift.name}</p>
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <Coins className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm font-medium">{gift.price}</span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={cn("mt-2 text-xs", getRarityColor(gift.rarity))}
                          >
                            {gift.rarity}
                          </Badge>
                          {gift.limited && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              Limited: {gift.stock} left
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {/* Gift Configuration */}
                {selectedGift && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Configure Your Gift</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{selectedGift.emoji}</div>
                        <div className="flex-1">
                          <p className="font-semibold">{selectedGift.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedGift.description || `Send a ${selectedGift.name} to show your support!`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="text-lg font-bold">
                              {selectedGift.price * giftAmount * comboMultiplier}
                            </span>
                          </div>
                          {comboMultiplier > 1 && (
                            <span className="text-xs text-muted-foreground">
                              ({selectedGift.price} x {giftAmount} x {comboMultiplier})
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedGift.stackable && (
                        <div className="space-y-2">
                          <Label>Quantity: {giftAmount}</Label>
                          <Slider
                            value={[giftAmount]}
                            onValueChange={([value]) => setGiftAmount(value)}
                            min={1}
                            max={10}
                            step={1}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Add a message (optional)</Label>
                        <Textarea
                          placeholder="Your message..."
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          maxLength={100}
                          className="resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="anonymous"
                              checked={isAnonymous}
                              onChange={(e) => setIsAnonymous(e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                              Send anonymously
                            </Label>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {giftMessage.length}/100
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={sendGift}
                        disabled={!selectedGift || selectedGift.price * giftAmount > userBalance.coins}
                      >
                        Send Gift
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {transactions.slice(0, 20).map((transaction) => (
                      <Card key={transaction.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{transaction.giftEmoji}</span>
                              <div>
                                <p className="text-sm font-medium">
                                  {transaction.isAnonymous ? 'Anonymous' : transaction.fromUsername}
                                  {transaction.toUsername && (
                                    <span className="text-muted-foreground">
                                      {' → '}{transaction.toUsername}
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(transaction.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">
                                {transaction.amount > 1 && `${transaction.amount}x `}
                                {transaction.giftName}
                              </Badge>
                              <div className="flex items-center gap-1 mt-1">
                                <Coins className="h-3 w-3 text-yellow-500" />
                                <span className="text-sm">{transaction.totalValue}</span>
                              </div>
                            </div>
                          </div>
                          {transaction.message && (
                            <p className="text-sm mt-2 text-muted-foreground italic">
                              "{transaction.message}"
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="balance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Coins className="h-8 w-8 text-yellow-500" />
                        <div>
                          <p className="text-2xl font-bold">{userBalance.coins}</p>
                          <p className="text-sm text-muted-foreground">Coins</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gem className="h-8 w-8 text-purple-500" />
                        <div>
                          <p className="text-2xl font-bold">{userBalance.gems}</p>
                          <p className="text-sm text-muted-foreground">Gems</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Level {userBalance.level}</span>
                        <span className="text-sm text-muted-foreground">
                          {userBalance.nextLevelProgress}%
                        </span>
                      </div>
                      <Progress value={userBalance.nextLevelProgress} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Spent:</span>
                        <span className="font-medium">{userBalance.totalSpent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Received:</span>
                        <span className="font-medium">{userBalance.totalReceived}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Purchase Coins</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => purchaseCoins(100)}
                          className="flex flex-col h-auto py-3"
                        >
                          <span className="text-lg font-bold">100</span>
                          <span className="text-xs text-muted-foreground">$0.99</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => purchaseCoins(500)}
                          className="flex flex-col h-auto py-3"
                        >
                          <span className="text-lg font-bold">500</span>
                          <span className="text-xs text-muted-foreground">$4.99</span>
                          <Badge className="mt-1 text-xs">Popular</Badge>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => purchaseCoins(1000)}
                          className="flex flex-col h-auto py-3"
                        >
                          <span className="text-lg font-bold">1000</span>
                          <span className="text-xs text-muted-foreground">$9.99</span>
                          <Badge className="mt-1 text-xs" variant="destructive">
                            Best Value
                          </Badge>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Gift Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Gift</DialogTitle>
              <DialogDescription>
                Please confirm your gift transaction
              </DialogDescription>
            </DialogHeader>
            {pendingTransaction && selectedGift && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <span className="text-4xl">{selectedGift.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {pendingTransaction.amount}x {selectedGift.name}
                    </p>
                    {pendingTransaction.toUsername && (
                      <p className="text-sm text-muted-foreground">
                        To: {pendingTransaction.toUsername}
                      </p>
                    )}
                    {pendingTransaction.message && (
                      <p className="text-sm italic mt-1">"{pendingTransaction.message}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-xl font-bold">
                        {pendingTransaction.totalValue}
                      </span>
                    </div>
                    {comboMultiplier > 1 && (
                      <Badge variant="secondary" className="mt-1">
                        {comboMultiplier}x Combo
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className="font-medium">{userBalance.coins} coins</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">After Transaction:</span>
                  <span className={cn(
                    "font-medium",
                    userBalance.coins - (pendingTransaction.totalValue || 0) < 0 && "text-destructive"
                  )}>
                    {userBalance.coins - (pendingTransaction.totalValue || 0)} coins
                  </span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={confirmGiftTransaction}>
                Confirm & Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Leaderboard Dialog */}
        <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gift Leaderboard</DialogTitle>
              <DialogDescription>
                Top gift receivers for this event
              </DialogDescription>
            </DialogHeader>
            
            {giftGoal && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Event Gift Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{giftGoal.current} / {giftGoal.target} gifts</span>
                      <span>{((giftGoal.current / giftGoal.target) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(giftGoal.current / giftGoal.target) * 100} />
                  </div>
                </CardContent>
              </Card>
            )}

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <Card key={entry.userId}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold">
                          {entry.rank}
                        </div>
                        
                        <Avatar>
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.username[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <p className="font-medium">{entry.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.totalGiftsReceived} gifts received
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="font-bold">{entry.totalValue}</span>
                          </div>
                          {entry.topGift && (
                            <span className="text-sm text-muted-foreground">
                              Top: {entry.topGift}
                            </span>
                          )}
                        </div>
                        
                        {entry.trend === 'up' && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gift History</DialogTitle>
              <DialogDescription>
                Your recent gift transactions
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="received">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="received">Received</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="received">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {transactions
                      .filter(t => t.toUserId === userId)
                      .map((transaction) => (
                        <Card key={transaction.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{transaction.giftEmoji}</span>
                                <div>
                                  <p className="text-sm font-medium">
                                    From: {transaction.isAnonymous ? 'Anonymous' : transaction.fromUsername}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(transaction.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{transaction.totalValue}</span>
                              </div>
                            </div>
                            {transaction.message && (
                              <p className="text-sm mt-2 italic text-muted-foreground">
                                "{transaction.message}"
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="sent">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {transactions
                      .filter(t => t.fromUserId === userId)
                      .map((transaction) => (
                        <Card key={transaction.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{transaction.giftEmoji}</span>
                                <div>
                                  <p className="text-sm font-medium">
                                    To: {transaction.toUsername || 'Event'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(transaction.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{transaction.totalValue}</span>
                              </div>
                            </div>
                            {transaction.message && (
                              <p className="text-sm mt-2 italic text-muted-foreground">
                                "{transaction.message}"
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

const Separator = () => <div className="w-full h-px bg-border" />;

export default VirtualGifts;