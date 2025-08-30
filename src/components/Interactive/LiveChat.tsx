import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Send,
  Smile,
  AtSign,
  Pin,
  Trash2,
  Clock,
  Shield,
  Ban,
  UserCheck,
  Settings,
  Download,
  Filter,
  Star,
  Crown,
  AlertTriangle,
  MessageCircle,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
// import data from '@emoji-mart/data';
// import Picker from '@emoji-mart/react';

interface Message {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  role?: 'viewer' | 'subscriber' | 'moderator' | 'owner';
  isPinned?: boolean;
  isDeleted?: boolean;
  isBanned?: boolean;
  mentions?: string[];
  emotes?: string[];
  badges?: string[];
}

interface User {
  id: string;
  username: string;
  avatar?: string;
  role: 'viewer' | 'subscriber' | 'moderator' | 'owner';
  isBanned?: boolean;
  isTimeout?: boolean;
  timeoutUntil?: Date;
}

interface LiveChatProps {
  eventId: string;
  currentUser: User;
  isModeratorOrOwner?: boolean;
  className?: string;
  onUserBan?: (userId: string) => void;
  onUserTimeout?: (userId: string, duration: number) => void;
}

const LiveChat: React.FC<LiveChatProps> = ({
  eventId,
  currentUser,
  isModeratorOrOwner = false,
  className,
  onUserBan,
  onUserTimeout
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionSuggestions] = useState<User[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const [slowMode, setSlowMode] = useState(false);
  const [slowModeDelay, setSlowModeDelay] = useState(5);
  const [subscriberOnly, setSubscriberOnly] = useState(false);
  const [emoteOnly, setEmoteOnly] = useState(false);
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highlightMentions, setHighlightMentions] = useState(true);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const [customEmotes, setCustomEmotes] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      query: { eventId, userId: currentUser.id }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    socketInstance.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('messageDeleted', (messageId: string) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isDeleted: true } : msg
      ));
    });

    socketInstance.on('messagePinned', (message: Message) => {
      setPinnedMessage(message);
    });

    socketInstance.on('messageUnpinned', () => {
      setPinnedMessage(null);
    });

    socketInstance.on('userTyping', (users: string[]) => {
      setTypingUsers(users.filter(u => u !== currentUser.username));
    });

    socketInstance.on('userList', (users: User[]) => {
      setOnlineUsers(users);
    });

    socketInstance.on('chatSettings', (settings: any) => {
      setSlowMode(settings.slowMode);
      setSlowModeDelay(settings.slowModeDelay);
      setSubscriberOnly(settings.subscriberOnly);
      setEmoteOnly(settings.emoteOnly);
      setProfanityFilter(settings.profanityFilter);
    });

    socketInstance.on('customEmotes', (emotes: Record<string, string>) => {
      setCustomEmotes(emotes);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [eventId, currentUser.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Load custom emotes
  useEffect(() => {
    // Load custom emotes for the event
    const loadCustomEmotes = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/emotes`);
        const emotes = await response.json();
        setCustomEmotes(emotes);
      } catch (error) {
        console.error('Failed to load custom emotes:', error);
      }
    };

    loadCustomEmotes();
  }, [eventId]);

  const sendMessage = useCallback(() => {
    if (!socket || !inputValue.trim()) return;

    // Check slow mode
    if (slowMode && !isModeratorOrOwner && lastMessageTime) {
      const timeSinceLastMessage = Date.now() - lastMessageTime.getTime();
      if (timeSinceLastMessage < slowModeDelay * 1000) {
        const remainingTime = Math.ceil((slowModeDelay * 1000 - timeSinceLastMessage) / 1000);
        alert(`Slow mode is enabled. Please wait ${remainingTime} seconds.`);
        return;
      }
    }

    // Check subscriber-only mode
    if (subscriberOnly && currentUser.role === 'viewer' && !isModeratorOrOwner) {
      alert('Chat is in subscriber-only mode.');
      return;
    }

    // Check emote-only mode
    if (emoteOnly && !isModeratorOrOwner) {
      const hasText = inputValue.replace(/:[a-zA-Z0-9_]+:/g, '').trim();
      if (hasText) {
        alert('Chat is in emote-only mode.');
        return;
      }
    }

    // Apply profanity filter
    let filteredContent = inputValue;
    if (profanityFilter && !isModeratorOrOwner) {
      // Simple profanity filter - replace with actual implementation
      const profanityWords = ['badword1', 'badword2']; // Add actual list
      profanityWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredContent = filteredContent.replace(regex, '*'.repeat(word.length));
      });
    }

    // Extract mentions
    const mentions = filteredContent.match(/@\w+/g) || [];

    const message: Partial<Message> = {
      content: filteredContent,
      mentions: mentions.map(m => m.substring(1)),
      timestamp: new Date()
    };

    socket.emit('sendMessage', message);
    setInputValue('');
    setLastMessageTime(new Date());
    setShowEmojiPicker(false);
  }, [socket, inputValue, slowMode, slowModeDelay, subscriberOnly, emoteOnly, profanityFilter, isModeratorOrOwner, lastMessageTime, currentUser.role]);

  const handleTyping = useCallback(() => {
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', false);
    }, 1000);
  }, [socket, isTyping]);

  const deleteMessage = useCallback((messageId: string) => {
    if (!socket || !isModeratorOrOwner) return;
    socket.emit('deleteMessage', messageId);
  }, [socket, isModeratorOrOwner]);

  const pinMessage = useCallback((message: Message) => {
    if (!socket || !isModeratorOrOwner) return;
    socket.emit('pinMessage', message);
  }, [socket, isModeratorOrOwner]);

  const unpinMessage = useCallback(() => {
    if (!socket || !isModeratorOrOwner) return;
    socket.emit('unpinMessage');
  }, [socket, isModeratorOrOwner]);

  const timeoutUser = useCallback((userId: string, duration: number) => {
    if (!socket || !isModeratorOrOwner) return;
    socket.emit('timeoutUser', { userId, duration });
    if (onUserTimeout) {
      onUserTimeout(userId, duration);
    }
  }, [socket, isModeratorOrOwner, onUserTimeout]);

  const banUser = useCallback((userId: string) => {
    if (!socket || !isModeratorOrOwner) return;
    socket.emit('banUser', userId);
    if (onUserBan) {
      onUserBan(userId);
    }
  }, [socket, isModeratorOrOwner, onUserBan]);

  const updateChatSettings = useCallback(() => {
    if (!socket || !isModeratorOrOwner) return;
    
    socket.emit('updateSettings', {
      slowMode,
      slowModeDelay,
      subscriberOnly,
      emoteOnly,
      profanityFilter
    });
  }, [socket, isModeratorOrOwner, slowMode, slowModeDelay, subscriberOnly, emoteOnly, profanityFilter]);

  const exportChat = useCallback(() => {
    const chatLog = messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.username}: ${msg.content}`
    ).join('\n');

    const blob = new Blob([chatLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${eventId}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages, eventId]);

  const handleEmojiSelect = useCallback((emoji: any) => {
    setInputValue(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, []);

  const handleMention = useCallback((username: string) => {
    setInputValue(prev => prev + `@${username} `);
    setShowMentions(false);
    inputRef.current?.focus();
  }, []);

  const renderMessage = (message: Message) => {
    if (message.isDeleted && !isModeratorOrOwner) {
      return null;
    }

    const isOwnMessage = message.userId === currentUser.id;
    const isMentioned = message.mentions?.includes(currentUser.username);

    let processedContent = message.content;

    // Replace custom emotes
    Object.entries(customEmotes).forEach(([code, url]) => {
      const regex = new RegExp(`:${code}:`, 'g');
      processedContent = processedContent.replace(regex, 
        `<img src="${url}" alt="${code}" class="inline-block w-6 h-6 mx-1" />`
      );
    });

    // Highlight mentions
    if (highlightMentions) {
      processedContent = processedContent.replace(
        /@(\w+)/g,
        '<span class="text-primary font-semibold">@$1</span>'
      );
    }

    return (
      <div
        key={message.id}
        className={cn(
          "group hover:bg-muted/50 px-4 py-2 transition-colors",
          compactMode ? "py-0.5" : "py-2",
          isMentioned && highlightMentions && "bg-primary/10 border-l-2 border-primary",
          message.isDeleted && "opacity-50"
        )}
      >
        <div className={cn(
          "flex items-start gap-3",
          compactMode && "gap-2"
        )}>
          {!compactMode && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.avatar} />
              <AvatarFallback>{message.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "font-semibold",
                fontSize === 'small' && "text-sm",
                fontSize === 'large' && "text-lg"
              )}>
                {message.username}
              </span>

              {/* Role Badges */}
              {message.role === 'owner' && (
                <Badge variant="default" className="h-5 gap-1">
                  <Crown className="h-3 w-3" />
                  Owner
                </Badge>
              )}
              {message.role === 'moderator' && (
                <Badge variant="secondary" className="h-5 gap-1">
                  <Shield className="h-3 w-3" />
                  Mod
                </Badge>
              )}
              {message.role === 'subscriber' && (
                <Badge variant="outline" className="h-5 gap-1">
                  <Star className="h-3 w-3" />
                  Sub
                </Badge>
              )}

              {/* Custom Badges */}
              {message.badges?.map(badge => (
                <Badge key={badge} variant="outline" className="h-5">
                  {badge}
                </Badge>
              ))}

              {showTimestamps && (
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              )}

              {message.isPinned && (
                <Pin className="h-3 w-3 text-primary" />
              )}
            </div>

            <div className={cn(
              "break-words",
              fontSize === 'small' && "text-sm",
              fontSize === 'large' && "text-lg",
              message.isDeleted && "line-through italic"
            )}>
              {message.isDeleted ? (
                <span className="text-muted-foreground">Message deleted</span>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: processedContent }} />
              )}
            </div>
          </div>

          {/* Message Actions */}
          {isModeratorOrOwner && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Settings className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!message.isPinned ? (
                    <DropdownMenuItem onClick={() => pinMessage(message)}>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin Message
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={unpinMessage}>
                      <Pin className="h-4 w-4 mr-2" />
                      Unpin Message
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => deleteMessage(message.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Message
                  </DropdownMenuItem>

                  {message.userId !== currentUser.id && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => timeoutUser(message.userId, 60)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Timeout 1 min
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => timeoutUser(message.userId, 300)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Timeout 5 min
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => timeoutUser(message.userId, 600)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Timeout 10 min
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => banUser(message.userId)}
                        className="text-destructive"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background border rounded-lg", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-semibold">Live Chat</h3>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {onlineUsers.length}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Chat Settings */}
            {isModeratorOrOwner && (
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chat Settings</DialogTitle>
                    <DialogDescription>
                      Configure chat moderation settings
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slow-mode">Slow Mode</Label>
                      <Switch
                        id="slow-mode"
                        checked={slowMode}
                        onCheckedChange={setSlowMode}
                      />
                    </div>

                    {slowMode && (
                      <div className="space-y-2">
                        <Label>Delay (seconds)</Label>
                        <Input
                          type="number"
                          value={slowModeDelay}
                          onChange={(e) => setSlowModeDelay(parseInt(e.target.value))}
                          min={1}
                          max={120}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sub-only">Subscriber Only</Label>
                      <Switch
                        id="sub-only"
                        checked={subscriberOnly}
                        onCheckedChange={setSubscriberOnly}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="emote-only">Emote Only</Label>
                      <Switch
                        id="emote-only"
                        checked={emoteOnly}
                        onCheckedChange={setEmoteOnly}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="profanity">Profanity Filter</Label>
                      <Switch
                        id="profanity"
                        checked={profanityFilter}
                        onCheckedChange={setProfanityFilter}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={updateChatSettings}>
                      Save Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* View Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>View Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuCheckboxItem
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                >
                  Auto-scroll
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuCheckboxItem
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                >
                  Compact Mode
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuCheckboxItem
                  checked={showTimestamps}
                  onCheckedChange={setShowTimestamps}
                >
                  Show Timestamps
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuCheckboxItem
                  checked={highlightMentions}
                  onCheckedChange={setHighlightMentions}
                >
                  Highlight Mentions
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>Font Size</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFontSize('small')}>
                  Small
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFontSize('medium')}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFontSize('large')}>
                  Large
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Chat */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={exportChat}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Chat</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Pinned Message */}
        {pinnedMessage && (
          <div className="px-4 py-2 bg-primary/10 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Pin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{pinnedMessage.username}:</span>
              <span className="text-sm">{pinnedMessage.content}</span>
            </div>
            {isModeratorOrOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={unpinMessage}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Chat Modes Indicators */}
        {(slowMode || subscriberOnly || emoteOnly) && (
          <div className="px-4 py-2 bg-muted border-b flex items-center gap-2">
            {slowMode && (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Slow Mode: {slowModeDelay}s
              </Badge>
            )}
            {subscriberOnly && (
              <Badge variant="secondary">
                <UserCheck className="h-3 w-3 mr-1" />
                Subscribers Only
              </Badge>
            )}
            {emoteOnly && (
              <Badge variant="secondary">
                <Smile className="h-3 w-3 mr-1" />
                Emote Only
              </Badge>
            )}
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-0">
          <div className="py-4">
            {messages.map(renderMessage)}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="px-4 py-2 text-sm text-muted-foreground italic">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : typingUsers.length === 2
                  ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                  : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`
                }
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            {/* Emoji Picker - Temporarily disabled */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleEmojiSelect({ native: '😊' })}
              title="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>

            {/* Mention Button */}
            <Popover open={showMentions} onOpenChange={setShowMentions}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <AtSign className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="start">
                <div className="space-y-1">
                  <p className="text-sm font-semibold mb-2">Mention User</p>
                  {onlineUsers.slice(0, 10).map(user => (
                    <Button
                      key={user.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleMention(user.username)}
                    >
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                      </Avatar>
                      {user.username}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Message Input */}
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                emoteOnly && !isModeratorOrOwner
                  ? "Emote-only mode"
                  : subscriberOnly && currentUser.role === 'viewer' && !isModeratorOrOwner
                  ? "Subscriber-only mode"
                  : "Type a message..."
              }
              disabled={
                !isConnected ||
                (subscriberOnly && currentUser.role === 'viewer' && !isModeratorOrOwner) ||
                (emoteOnly && !isModeratorOrOwner)
              }
              className="flex-1"
            />

            {/* Send Button */}
            <Button 
              onClick={sendMessage}
              disabled={
                !isConnected || 
                !inputValue.trim() ||
                (subscriberOnly && currentUser.role === 'viewer' && !isModeratorOrOwner)
              }
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Character Count / Slow Mode Timer */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {inputValue.length}/500
            </span>
            
            {slowMode && lastMessageTime && !isModeratorOrOwner && (
              <span className="text-xs text-muted-foreground">
                Slow mode: Wait {Math.max(0, Math.ceil(
                  (slowModeDelay * 1000 - (Date.now() - lastMessageTime.getTime())) / 1000
                ))}s
              </span>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LiveChat;