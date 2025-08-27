import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Settings, 
  AlertTriangle, 
  Clock, 
  Trash2, 
  Flag, 
  Pin,
  Users,
  Shield,
  Search,
  Filter,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Activity,
  CheckCircle,
  Globe,
  Send,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2
} from 'lucide-react';
import wsService from '../services/websocket';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage, EventChatSummary, ModerationAlert, AlertSeverity, UserRole, SentimentScore, ModerationAction, MessageType } from '../types/chat';

// Interface for typing users
interface TypingUser {
  userId: string;
  username: string;
  lastTyping: number;
}

export default function ChatModerationPage() {
  // Auth context
  const { user } = useAuth();
  
  // State management
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [multiView, setMultiView] = useState(false);
  const [multiViewEvents, setMultiViewEvents] = useState<string[]>([]);
  const [activeEvents, setActiveEvents] = useState<EventChatSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [alerts, setAlerts] = useState<ModerationAlert[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [messageFilters, setMessageFilters] = useState({
    severity: [] as AlertSeverity[],
    sentiment: [] as SentimentScore[],
    userRole: [] as UserRole[],
    flagged: false,
    reported: false
  });
  
  // Real-time state
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current event and initialize WebSocket connection
  const currentEvent = activeEvents.find(e => e.eventId === selectedEventId);
  
  // Load active events from API
  useEffect(() => {
    loadActiveEvents();
  }, []);
  
  const loadActiveEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const events = await apiClient.getEvents();
      // Filter for active events only
      const activeEventsData = events.filter((event: any) => 
        event.status === 'active' || event.status === 'live'
      ).map((event: any) => ({
        eventId: event.id,
        eventTitle: event.title || event.name,
        status: event.status,
        participantCount: event.participant_count || 0,
        messageCount: event.message_count || 0,
        messagesPerMinute: event.messages_per_minute || 0,
        moderatorCount: event.moderator_count || 0,
        pendingActions: event.pending_actions || 0,
        alertCount: event.alert_count || { critical: 0, high: 0, medium: 0, low: 0 },
        lastActivity: event.last_activity || Date.now(),
        chatEnabled: event.chat_enabled !== false,
        slowMode: event.slow_mode || false,
        slowModeDelay: event.slow_mode_delay || 0,
        subscriberOnly: event.subscriber_only || false,
        moderatedMode: event.moderated_mode || false,
        emotesOnly: event.emotes_only || false,
        linksDisabled: event.links_disabled || false
      }));
      
      setActiveEvents(activeEventsData);
      
      // Auto-select first event if available
      if (activeEventsData.length > 0 && !selectedEventId) {
        setSelectedEventId(activeEventsData[0].eventId);
      }
    } catch (error) {
      console.log('Failed to load events:', error);
      // Just show empty state
      setActiveEvents([]);
      setMessages([]);
      setAlerts([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };
  
  // Filter messages based on current selection and filters
  const filteredMessages = useMemo(() => {
    let filtered = messages;
    
    if (!multiView) {
      filtered = filtered.filter(m => m.eventId === selectedEventId);
    } else {
      filtered = filtered.filter(m => multiViewEvents.includes(m.eventId));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (messageFilters.flagged) {
      filtered = filtered.filter(m => m.moderationFlags.length > 0);
    }
    
    if (messageFilters.reported) {
      filtered = filtered.filter(m => m.reportCount > 0);
    }
    
    if (messageFilters.userRole.length > 0) {
      filtered = filtered.filter(m => messageFilters.userRole.includes(m.userRole));
    }
    
    if (messageFilters.sentiment.length > 0) {
      filtered = filtered.filter(m => m.sentimentScore && messageFilters.sentiment.includes(m.sentimentScore));
    }
    
    return filtered.sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, selectedEventId, multiView, multiViewEvents, searchQuery, messageFilters]);

  // Pending alerts count
  const pendingAlertsCount = alerts.filter(a => !a.resolved).length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;

  // Initialize WebSocket connection when event is selected
  useEffect(() => {
    if (!selectedEventId) return;
    
    // Try to connect WebSocket (will fail silently if backend not available)
    const connectWebSocket = async () => {
      try {
        await wsService.connect(selectedEventId, { silent: true });
        setConnectionStatus('connected');
      } catch (error) {
        console.log('WebSocket connection failed:', error);
        setConnectionStatus('disconnected');
      }
    };
    
    if (selectedEventId) {
      connectWebSocket();
    }
    
    return () => {
      if (selectedEventId) {
        wsService.disconnect();
      }
    };
  }, [selectedEventId]);
  
  // WebSocket event handlers
  useEffect(() => {
    // Subscribe to WebSocket events
    const unsubscribers: (() => void)[] = [
      wsService.onWithUnsubscribe('connected', () => {
        setConnectionStatus('connected');
        // Rejoin event if we have one selected
        if (selectedEventId) {
          wsService.joinEvent(selectedEventId);
          loadChatHistory(selectedEventId);
        }
      }),
      
      wsService.onWithUnsubscribe('disconnected', () => {
        setConnectionStatus('disconnected');
      }),
      
      wsService.onWithUnsubscribe('reconnecting', (attemptNumber: number) => {
        setConnectionStatus('connecting');
        console.log(`Reconnecting... attempt ${attemptNumber}`);
      }),
      
      wsService.onWithUnsubscribe('chat:message', (data: ChatMessage) => {
        // Add new message to the list
        setMessages(prev => {
          // Check for duplicate message IDs
          if (prev.some(m => m.id === data.id)) {
            return prev;
          }
          return [...prev, {
            ...data,
            timestamp: data.timestamp || Date.now()
          }];
        });
        
        // Auto-scroll if enabled
        if (autoScroll && scrollAreaRef.current) {
          setTimeout(() => {
            scrollAreaRef.current?.scrollTo({
              top: scrollAreaRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }, 100);
        }
      }),
      
      wsService.onWithUnsubscribe('chat:typing', (data: any) => {
        // Update typing users
        if (data.userId !== user?.id) {
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            if (data.isTyping) {
              newMap.set(data.userId, {
                userId: data.userId,
                username: data.username || 'User',
                lastTyping: Date.now()
              });
            } else {
              newMap.delete(data.userId);
            }
            return newMap;
          });
        }
      }),
      
      wsService.onWithUnsubscribe('chat:user_joined', (data: any) => {
        // Add system message for user joining
        const systemMessage: ChatMessage = {
          id: `sys-join-${Date.now()}`,
          eventId: selectedEventId,
          userId: 'system',
          username: 'System',
          userRole: 'viewer',
          type: 'system',
          content: `${data.username} joined the chat`,
          timestamp: Date.now(),
          edited: false,
          deleted: false,
          pinned: false,
          reportCount: 0,
          moderationFlags: [],
          reactions: {}
        };
        setMessages(prev => [...prev, systemMessage]);
      }),
      
      wsService.onWithUnsubscribe('chat:user_left', (data: any) => {
        // Add system message for user leaving
        const systemMessage: ChatMessage = {
          id: `sys-left-${Date.now()}`,
          eventId: selectedEventId,
          userId: 'system',
          username: 'System',
          userRole: 'viewer',
          type: 'system',
          content: `${data.username} left the chat`,
          timestamp: Date.now(),
          edited: false,
          deleted: false,
          pinned: false,
          reportCount: 0,
          moderationFlags: [],
          reactions: {}
        };
        setMessages(prev => [...prev, systemMessage]);
        
        // Remove from typing users if they were typing
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }),
      
      wsService.onWithUnsubscribe('chat:alert', (data: ModerationAlert) => {
        setAlerts(prev => [data, ...prev]);
        if (soundAlerts && data.severity === 'critical') {
          // Play alert sound (could add actual audio here)
          console.log('Critical alert sound');
        }
      }),
      
      wsService.onWithUnsubscribe('chat:history', (data: any) => {
        // Handle chat history response
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      })
    ];

    // Clean up typing users periodically
    const typingCleanupInterval = setInterval(() => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const now = Date.now();
        for (const [userId, user] of newMap) {
          if (now - user.lastTyping > 5000) {
            newMap.delete(userId);
          }
        }
        return newMap;
      });
    }, 1000);
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
      clearInterval(typingCleanupInterval);
    };
  }, [selectedEventId, autoScroll, soundAlerts, user]);
  
  // Load chat history from API
  const loadChatHistory = async (eventId: string) => {
    setIsLoadingHistory(true);
    try {
      const history = await apiClient.getChatHistory(eventId);
      if (history && Array.isArray(history)) {
        setMessages(history.map((msg: any) => ({
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          eventId: msg.event_id || eventId,
          userId: msg.user_id || msg.userId,
          username: msg.username || 'Anonymous',
          userRole: msg.user_role || msg.userRole || 'viewer',
          avatar: msg.avatar,
          type: msg.type || 'text',
          content: msg.content || msg.message,
          timestamp: msg.timestamp || msg.created_at || Date.now(),
          edited: msg.edited || false,
          deleted: msg.deleted || false,
          pinned: msg.pinned || false,
          reportCount: msg.report_count || 0,
          moderationFlags: msg.moderation_flags || [],
          sentimentScore: msg.sentiment_score,
          toxicityLevel: msg.toxicity_level,
          isSpam: msg.is_spam,
          containsLinks: msg.contains_links,
          reactions: msg.reactions || {}
        })));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Send chat message
  const sendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedEventId) return;
    
    const message = messageInput.trim();
    setMessageInput('');
    
    // Send via WebSocket if connected, otherwise use API
    if (wsService.isConnected()) {
      wsService.sendChatMessage(message);
    } else {
      // Fallback to API
      try {
        await apiClient.sendChatMessage(selectedEventId, message);
      } catch (error) {
        console.error('Failed to send message:', error);
        // Restore message on error
        setMessageInput(message);
      }
    }
  }, [messageInput, selectedEventId, user]);
  
  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!selectedEventId || !wsService.isConnected()) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing indicator
    wsService.sendTypingIndicator(selectedEventId, true);
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      wsService.sendTypingIndicator(selectedEventId, false);
    }, 2000);
  }, [selectedEventId]);
  
  // Moderation actions
  const handleModerationAction = useCallback(async (messageId: string, action: ModerationAction, reason?: string, duration?: number) => {
    try {
      console.log('Moderation action:', { messageId, action, reason, duration });
      // API call would go here
      // await moderateMessage(messageId, action, reason, duration);
      
      // Update UI optimistically
      setSelectedMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    } catch (error) {
      console.error('Moderation action failed:', error);
    }
  }, []);

  const handleBulkAction = useCallback(async (action: ModerationAction, reason: string) => {
    if (selectedMessages.size === 0) return;
    
    try {
      console.log('Bulk moderation action:', { messageIds: Array.from(selectedMessages), action, reason });
      // Bulk API call would go here
      
      // Clear selection
      setSelectedMessages(new Set());
    } catch (error) {
      console.error('Bulk moderation action failed:', error);
    }
  }, [selectedMessages]);

  const resolveAlert = useCallback(async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true, resolvedAt: Date.now() }
        : alert
    ));
  }, []);

  // Message selection handlers
  const toggleMessageSelection = useCallback((messageId: string) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  const selectAllMessages = useCallback(() => {
    setSelectedMessages(new Set(filteredMessages.map(m => m.id)));
  }, [filteredMessages]);

  const clearSelection = useCallback(() => {
    setSelectedMessages(new Set());
  }, []);

  return (
    <DashboardLayout 
      title="Chat Moderation Dashboard" 
      subtitle="Monitor and manage chat across all active events"
      actions={
        <div className="flex gap-2">
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'connecting' ? 'secondary' : 'destructive'}
            className="flex items-center gap-1"
          >
            {connectionStatus === 'connected' ? (
              <><Wifi className="h-3 w-3" /> Connected</>
            ) : connectionStatus === 'connecting' ? (
              <><RefreshCw className="h-3 w-3 animate-spin" /> Connecting...</>
            ) : (
              <><WifiOff className="h-3 w-3" /> Disconnected</>
            )}
          </Badge>
          {criticalAlertsCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalAlertsCount} Critical
            </Badge>
          )}
          {pendingAlertsCount > 0 && (
            <Badge variant="secondary">
              {pendingAlertsCount} Alerts
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => setSoundAlerts(!soundAlerts)}>
            {soundAlerts ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Event Selector and Controls */}
        {isLoadingEvents ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2">Loading events...</span>
            </CardContent>
          </Card>
        ) : activeEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No active events available</p>
              <p className="text-sm text-gray-500 mt-1">Events with active chat will appear here</p>
              <Button onClick={loadActiveEvents} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Events
              </Button>
            </CardContent>
          </Card>
        ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Events</CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={multiView}
                  onCheckedChange={setMultiView}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Multi-View</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeEvents.map(event => (
                <div 
                  key={event.eventId}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedEventId === event.eventId || (multiView && multiViewEvents.includes(event.eventId))
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (multiView) {
                      setMultiViewEvents(prev => 
                        prev.includes(event.eventId) 
                          ? prev.filter(id => id !== event.eventId)
                          : [...prev, event.eventId]
                      );
                    } else {
                      setSelectedEventId(event.eventId);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium truncate">{event.eventTitle}</h3>
                    <Badge 
                      variant={event.status === 'active' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.participantCount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {event.messagesPerMinute}/min
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {event.moderatorCount} mods
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {event.pendingActions} pending
                    </div>
                  </div>
                  
                  {/* Alert indicators */}
                  {Object.entries(event.alertCount).some(([_, count]) => count > 0) && (
                    <div className="flex gap-1 mt-2">
                      {event.alertCount.critical > 0 && (
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          {event.alertCount.critical}
                        </Badge>
                      )}
                      {event.alertCount.high > 0 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 bg-orange-100 text-orange-800">
                          {event.alertCount.high}
                        </Badge>
                      )}
                      {event.alertCount.medium > 0 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 bg-yellow-100 text-yellow-800">
                          {event.alertCount.medium}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Feed */}
          <div className="lg:col-span-3">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chat Feed
                    {currentEvent && (
                      <Badge variant="outline">
                        {currentEvent.eventTitle}
                      </Badge>
                    )}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    {/* Search and filters */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search messages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-64"
                        />
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Message Filters</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">User Role</label>
                              <div className="flex gap-2 mt-1">
                                {['viewer', 'subscriber', 'moderator', 'admin'].map(role => (
                                  <Badge 
                                    key={role}
                                    variant={messageFilters.userRole.includes(role as UserRole) ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      setMessageFilters(prev => ({
                                        ...prev,
                                        userRole: prev.userRole.includes(role as UserRole)
                                          ? prev.userRole.filter(r => r !== role)
                                          : [...prev.userRole, role as UserRole]
                                      }));
                                    }}
                                  >
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="flagged"
                                checked={messageFilters.flagged}
                                onCheckedChange={(checked) => 
                                  setMessageFilters(prev => ({ ...prev, flagged: checked as boolean }))
                                }
                              />
                              <label htmlFor="flagged" className="text-sm font-medium">Show flagged only</label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="reported"
                                checked={messageFilters.reported}
                                onCheckedChange={(checked) => 
                                  setMessageFilters(prev => ({ ...prev, reported: checked as boolean }))
                                }
                              />
                              <label htmlFor="reported" className="text-sm font-medium">Show reported only</label>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAutoScroll(!autoScroll)}
                    >
                      {autoScroll ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Bulk actions */}
                {selectedMessages.size > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedMessages.size} messages selected
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={clearSelection}>
                        Clear
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete', 'Bulk delete')}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('timeout', 'Bulk timeout')}>
                        <Clock className="h-4 w-4 mr-1" />
                        Timeout Users
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {isLoadingHistory && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    <span className="ml-2 text-sm text-gray-500">Loading chat history...</span>
                  </div>
                )}
                
                <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                  <div className="space-y-4 py-4">
                    {filteredMessages.map((message) => {
                      const isSelected = selectedMessages.has(message.id);
                      const isFlagged = message.moderationFlags.length > 0;
                      const isHighToxicity = (message.toxicityLevel || 0) > 70;
                      
                      return (
                        <div 
                          key={message.id} 
                          className={`group relative p-3 rounded-lg border transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                              : isFlagged 
                                ? 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'
                                : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Selection checkbox */}
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleMessageSelection(message.id)}
                              className="mt-1"
                            />
                            
                            {/* User avatar */}
                            <Avatar className="h-8 w-8">
                              {message.avatar ? (
                                <AvatarImage src={message.avatar} alt={message.username} />
                              ) : null}
                              <AvatarFallback>
                                {message.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Message content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-medium text-sm ${
                                  message.userRole === 'admin' ? 'text-red-600' :
                                  message.userRole === 'moderator' ? 'text-green-600' :
                                  message.userRole === 'subscriber' ? 'text-purple-600' :
                                  'text-gray-900 dark:text-gray-100'
                                }`}>
                                  {message.username}
                                </span>
                                
                                <Badge variant="outline" className="text-xs">
                                  {message.userRole}
                                </Badge>
                                
                                {message.pinned && (
                                  <Pin className="h-3 w-3 text-blue-600" />
                                )}
                                
                                <span className="text-xs text-gray-500">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                                
                                {/* Sentiment indicator */}
                                {message.sentimentScore && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      message.sentimentScore === 'positive' ? 'text-green-600 border-green-300' :
                                      message.sentimentScore === 'negative' ? 'text-orange-600 border-orange-300' :
                                      message.sentimentScore === 'toxic' ? 'text-red-600 border-red-300' :
                                      'text-gray-600 border-gray-300'
                                    }`}
                                  >
                                    {message.sentimentScore}
                                    {message.toxicityLevel && message.toxicityLevel > 50 && (
                                      <span className="ml-1">({message.toxicityLevel}%)</span>
                                    )}
                                  </Badge>
                                )}
                                
                                {/* Moderation flags */}
                                {message.moderationFlags.map(flag => (
                                  <Badge key={flag} variant="destructive" className="text-xs">
                                    {flag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <p className={`text-sm break-words ${
                                message.deleted ? 'italic text-gray-400 line-through' :
                                isHighToxicity ? 'text-red-700 dark:text-red-300' :
                                'text-gray-700 dark:text-gray-300'
                              }`}>
                                {message.deleted ? '[Message deleted]' : message.content}
                              </p>
                              
                              {/* Reactions */}
                              {Object.keys(message.reactions).length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {Object.entries(message.reactions).map(([emoji, count]) => (
                                    <Badge key={emoji} variant="outline" className="text-xs">
                                      {emoji} {count}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {/* Report count */}
                              {message.reportCount > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Flag className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">
                                    {message.reportCount} reports
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Quick actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleModerationAction(message.id, 'delete', 'Inappropriate content')}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleModerationAction(message.id, 'timeout', 'Rule violation', 300)}
                              >
                                <Clock className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => console.log('View user profile:', message.userId)}
                              >
                                <Users className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing indicators */}
                    {typingUsers.size > 0 && (
                      <div className="flex items-center gap-2 p-3 text-sm text-gray-500">
                        <div className="flex gap-1">
                          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                        </div>
                        <span>
                          {Array.from(typingUsers.values())
                            .slice(0, 3)
                            .map(u => u.username)
                            .join(', ')}
                          {typingUsers.size > 3 && ` and ${typingUsers.size - 3} others`}
                          {typingUsers.size === 1 ? ' is' : ' are'} typing...
                        </span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message input area */}
                <div className="border-t p-4">
                  <div className="space-y-3">
                    {/* Quick select actions for moderators */}
                    {user?.role === 'moderator' || user?.role === 'admin' || user?.role === 'platform_admin' ? (
                      <div className="flex justify-between items-center text-sm mb-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={selectAllMessages}>
                            Select All ({filteredMessages.length})
                          </Button>
                          <Button size="sm" variant="outline" onClick={clearSelection}>
                            Clear Selection
                          </Button>
                        </div>
                        <span className="text-gray-500">
                          {filteredMessages.length} messages • {selectedMessages.size} selected
                        </span>
                      </div>
                    ) : null}
                    
                    {/* Message input */}
                    <div className="flex gap-2">
                      <Textarea
                        ref={messageInputRef}
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          handleTyping();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder={
                          connectionStatus === 'connected' 
                            ? `Send a message to ${currentEvent?.eventTitle || 'chat'}...`
                            : connectionStatus === 'connecting'
                            ? 'Connecting to chat...'
                            : 'Chat disconnected - reconnecting...'
                        }
                        disabled={connectionStatus !== 'connected' || !currentEvent?.chatEnabled}
                        className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!messageInput.trim() || connectionStatus !== 'connected' || !currentEvent?.chatEnabled}
                        size="icon"
                        className="h-[60px] w-[60px]"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Chat status indicators */}
                    {currentEvent && (
                      <div className="flex gap-2 text-xs">
                        {currentEvent.slowMode && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Slow mode: {currentEvent.slowModeDelay}s
                          </Badge>
                        )}
                        {currentEvent.subscriberOnly && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Subscribers only
                          </Badge>
                        )}
                        {currentEvent.moderatedMode && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Moderated
                          </Badge>
                        )}
                        {!currentEvent.chatEnabled && (
                          <Badge variant="destructive" className="text-xs">
                            Chat disabled
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Alerts Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alerts
                  {pendingAlertsCount > 0 && (
                    <Badge variant="destructive">
                      {pendingAlertsCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {alerts.filter(a => !a.resolved).slice(0, 10).map(alert => (
                      <div 
                        key={alert.id} 
                        className={`p-3 rounded-lg border ${
                          alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                          alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' :
                          alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                          'border-gray-300 bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {alert.severity}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium">{alert.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {alert.message}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        {alert.requiresAction && (
                          <div className="flex gap-1 mt-2">
                            {alert.messageId && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleModerationAction(alert.messageId!, 'delete', 'Alert action')}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            )}
                            {alert.userId && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => console.log('View user profile:', alert.userId)}
                              >
                                <Users className="h-3 w-3 mr-1" />
                                User
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Live Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Live Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentEvent && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentEvent.participantCount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currentEvent.messagesPerMinute}
                        </div>
                        <div className="text-xs text-gray-500">Msg/min</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Engagement Rate</span>
                        <span className="font-medium">73%</span>
                      </div>
                      <Progress value={73} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Auto-mod Accuracy</span>
                        <span className="font-medium">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>Slow Mode</span>
                        {currentEvent.slowMode ? (
                          <Badge variant="secondary">{currentEvent.slowModeDelay}s</Badge>
                        ) : (
                          <Badge variant="outline">Off</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>Sub Only</span>
                        <Badge variant={currentEvent.subscriberOnly ? 'default' : 'outline'}>
                          {currentEvent.subscriberOnly ? 'On' : 'Off'}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Moderation Settings
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Banned Users ({24})
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Flag className="h-4 w-4 mr-2" />
                  Keyword Filters
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Analytics Report
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Global Chat Rules
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}