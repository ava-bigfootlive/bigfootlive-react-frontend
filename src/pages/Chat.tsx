import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Globe
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import type { ChatMessage, EventChatSummary, ModerationAlert, AlertSeverity, UserRole, SentimentScore, ModerationAction } from '../types/chat';

// Mock data for demonstration
const mockActiveEvents: EventChatSummary[] = [
  {
    eventId: '1',
    eventTitle: 'BigFoot Gaming Championship',
    status: 'active',
    participantCount: 1247,
    messageCount: 15847,
    messagesPerMinute: 23,
    moderatorCount: 3,
    pendingActions: 7,
    alertCount: { critical: 1, high: 3, medium: 8, low: 15 },
    lastActivity: Date.now() - 5000,
    chatEnabled: true,
    slowMode: false,
    slowModeDelay: 0,
    subscriberOnly: false,
    moderatedMode: false,
    emotesOnly: false,
    linksDisabled: false
  },
  {
    eventId: '2',
    eventTitle: 'Tech Talk: AI in Streaming',
    status: 'active',
    participantCount: 432,
    messageCount: 3241,
    messagesPerMinute: 8,
    moderatorCount: 2,
    pendingActions: 2,
    alertCount: { critical: 0, high: 1, medium: 3, low: 5 },
    lastActivity: Date.now() - 12000,
    chatEnabled: true,
    slowMode: true,
    slowModeDelay: 30,
    subscriberOnly: false,
    moderatedMode: false,
    emotesOnly: false,
    linksDisabled: true
  },
  {
    eventId: '3',
    eventTitle: 'Music Festival Live',
    status: 'active',
    participantCount: 2891,
    messageCount: 47392,
    messagesPerMinute: 67,
    moderatorCount: 5,
    pendingActions: 23,
    alertCount: { critical: 2, high: 12, medium: 31, low: 87 },
    lastActivity: Date.now() - 1000,
    chatEnabled: true,
    slowMode: false,
    slowModeDelay: 0,
    subscriberOnly: false,
    moderatedMode: true,
    emotesOnly: false,
    linksDisabled: false
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    eventId: '1',
    userId: 'user1',
    username: 'GamerPro2024',
    userRole: 'subscriber',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro2024',
    type: 'text',
    content: 'This gameplay is absolutely insane! 🔥',
    timestamp: Date.now() - 30000,
    edited: false,
    deleted: false,
    pinned: false,
    reportCount: 0,
    moderationFlags: [],
    sentimentScore: 'positive',
    toxicityLevel: 5,
    isSpam: false,
    reactions: { '🔥': 12, '👍': 8 }
  },
  {
    id: '2',
    eventId: '1',
    userId: 'user2',
    username: 'ToxicTroll99',
    userRole: 'viewer',
    type: 'text',
    content: 'This is boring, streamer is trash and should quit',
    timestamp: Date.now() - 25000,
    edited: false,
    deleted: false,
    pinned: false,
    reportCount: 3,
    moderationFlags: ['harassment', 'toxic'],
    sentimentScore: 'toxic',
    toxicityLevel: 89,
    isSpam: false,
    reactions: {}
  },
  {
    id: '3',
    eventId: '1',
    userId: 'user3',
    username: 'ChatModerator',
    userRole: 'moderator',
    type: 'text',
    content: 'Please keep the chat respectful everyone! Remember our community guidelines.',
    timestamp: Date.now() - 20000,
    edited: false,
    deleted: false,
    pinned: true,
    reportCount: 0,
    moderationFlags: [],
    sentimentScore: 'neutral',
    toxicityLevel: 2,
    reactions: { '👍': 45, '❤️': 23 }
  },
  {
    id: '4',
    eventId: '1',
    userId: 'user4',
    username: 'SpamBot2024',
    userRole: 'viewer',
    type: 'text',
    content: 'GET FREE ROBUX HERE!!! bit.ly/totallylegit-robux HURRY LIMITED TIME!!!',
    timestamp: Date.now() - 15000,
    edited: false,
    deleted: false,
    pinned: false,
    reportCount: 8,
    moderationFlags: ['spam', 'suspicious_link'],
    isSpam: true,
    containsLinks: true,
    reactions: {}
  }
];

const mockAlerts: ModerationAlert[] = [
  {
    id: '1',
    eventId: '1',
    type: 'toxicity',
    severity: 'high',
    title: 'High Toxicity Detected',
    message: 'Message from ToxicTroll99 flagged for toxic content (89% toxicity score)',
    timestamp: Date.now() - 25000,
    messageId: '2',
    userId: 'user2',
    resolved: false,
    autoGenerated: true,
    requiresAction: true,
    metadata: { toxicityScore: 89, reportCount: 3 }
  },
  {
    id: '2',
    eventId: '1',
    type: 'spam',
    severity: 'critical',
    title: 'Spam Link Detected',
    message: 'SpamBot2024 posted suspicious link with spam content',
    timestamp: Date.now() - 15000,
    messageId: '4',
    userId: 'user4',
    resolved: false,
    autoGenerated: true,
    requiresAction: true,
    metadata: { linkCount: 1, spamScore: 95 }
  }
];

export default function ChatModerationPage() {
  // State management
  const [selectedEventId, setSelectedEventId] = useState<string>('1');
  const [multiView, setMultiView] = useState(false);
  const [multiViewEvents, setMultiViewEvents] = useState<string[]>(['1', '2']);
  const [activeEvents] = useState<EventChatSummary[]>(mockActiveEvents);
  const [messages] = useState<ChatMessage[]>(mockMessages);
  const [alerts, setAlerts] = useState<ModerationAlert[]>(mockAlerts);
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

  // WebSocket integration
  const { subscribe, isConnected } = useWebSocket();

  // Get current event
  const currentEvent = activeEvents.find(e => e.eventId === selectedEventId);
  
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

  // WebSocket event handlers
  useEffect(() => {
    const unsubscribers = [
      subscribe('chat:message', (data: ChatMessage) => {
        // Handle new message
        console.log('New chat message:', data);
      }),
      subscribe('chat:alert', (data: ModerationAlert) => {
        setAlerts(prev => [data, ...prev]);
        if (soundAlerts && data.severity === 'critical') {
          // Play alert sound
          console.log('Critical alert sound');
        }
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscribe, soundAlerts]);

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
          <Badge variant={isConnected() ? 'default' : 'destructive'}>
            {isConnected() ? 'Connected' : 'Disconnected'}
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
                <ScrollArea className="flex-1 px-6">
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
                  </div>
                </ScrollArea>
                
                {/* Quick select actions */}
                <div className="border-t p-3">
                  <div className="flex justify-between items-center text-sm">
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