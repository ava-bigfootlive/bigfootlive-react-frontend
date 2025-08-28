import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon,
  Clock,
  Video,
  Radio,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Users,
  Settings,
  Bell,
  Repeat,
  Timer,
  Zap
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isToday, isPast, isFuture } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface ScheduledContent {
  id: string;
  title: string;
  type: 'live' | 'vod' | 'premiere';
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  scheduledDate: Date;
  duration: number;
  thumbnail?: string;
  visibility: 'public' | 'private' | 'unlisted';
  recurring?: {
    enabled: boolean;
    pattern: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
  notifications?: {
    enabled: boolean;
    timing: number; // minutes before event
  };
  description?: string;
  tags?: string[];
}

export const ContentScheduler: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'timeline'>('calendar');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null);
  
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([
    {
      id: '1',
      title: 'Morning Workout Live Stream',
      type: 'live',
      status: 'scheduled',
      scheduledDate: new Date(2024, 1, 26, 9, 0),
      duration: 60,
      visibility: 'public',
      recurring: {
        enabled: true,
        pattern: 'daily'
      },
      notifications: {
        enabled: true,
        timing: 15
      },
      tags: ['fitness', 'morning', 'workout']
    },
    {
      id: '2',
      title: 'Product Launch Event',
      type: 'premiere',
      status: 'scheduled',
      scheduledDate: new Date(2024, 1, 28, 14, 0),
      duration: 120,
      visibility: 'public',
      notifications: {
        enabled: true,
        timing: 60
      },
      tags: ['launch', 'product', 'special']
    },
    {
      id: '3',
      title: 'Weekly Q&A Session',
      type: 'live',
      status: 'live',
      scheduledDate: new Date(),
      duration: 45,
      visibility: 'public',
      recurring: {
        enabled: true,
        pattern: 'weekly'
      },
      tags: ['qa', 'interactive', 'weekly']
    },
    {
      id: '4',
      title: 'Tutorial Series - Episode 5',
      type: 'vod',
      status: 'scheduled',
      scheduledDate: new Date(2024, 1, 27, 10, 0),
      duration: 30,
      visibility: 'public',
      tags: ['tutorial', 'education', 'series']
    }
  ]);

  const [newSchedule, setNewSchedule] = useState<Partial<ScheduledContent>>({
    title: '',
    type: 'live',
    visibility: 'public',
    duration: 60,
    notifications: {
      enabled: true,
      timing: 15
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'destructive';
      case 'scheduled': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'live': return <Radio className="h-4 w-4" />;
      case 'vod': return <Video className="h-4 w-4" />;
      case 'premiere': return <PlayCircle className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(scheduledContent);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScheduledContent(items);
  };

  const duplicateContent = (content: ScheduledContent) => {
    const newContent = {
      ...content,
      id: Date.now().toString(),
      title: `${content.title} (Copy)`,
      scheduledDate: addDays(content.scheduledDate, 1),
      status: 'scheduled' as const
    };
    setScheduledContent([...scheduledContent, newContent]);
    toast({
      title: "Content Duplicated",
      description: "Schedule has been duplicated for tomorrow"
    });
  };

  const cancelContent = (id: string) => {
    setScheduledContent(
      scheduledContent.map(content =>
        content.id === id ? { ...content, status: 'cancelled' as const } : content
      )
    );
    toast({
      title: "Content Cancelled",
      description: "The scheduled content has been cancelled"
    });
  };

  const createSchedule = () => {
    if (!newSchedule.title || !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const schedule: ScheduledContent = {
      id: Date.now().toString(),
      title: newSchedule.title,
      type: newSchedule.type as 'live' | 'vod' | 'premiere',
      status: 'scheduled',
      scheduledDate: selectedDate,
      duration: newSchedule.duration || 60,
      visibility: newSchedule.visibility as 'public' | 'private' | 'unlisted',
      notifications: newSchedule.notifications,
      description: newSchedule.description,
      tags: newSchedule.tags
    };

    setScheduledContent([...scheduledContent, schedule]);
    setShowScheduleDialog(false);
    setNewSchedule({
      title: '',
      type: 'live',
      visibility: 'public',
      duration: 60,
      notifications: {
        enabled: true,
        timing: 15
      }
    });
    
    toast({
      title: "Content Scheduled",
      description: `${schedule.title} has been scheduled for ${format(selectedDate, 'PPP')}`
    });
  };

  const todaysContent = scheduledContent.filter(content => 
    isToday(content.scheduledDate)
  );

  const upcomingContent = scheduledContent.filter(content =>
    isFuture(content.scheduledDate) && !isToday(content.scheduledDate)
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Scheduler</h1>
          <p className="text-muted-foreground">Plan and schedule your content releases</p>
        </div>
        <Button onClick={() => setShowScheduleDialog(true)}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule Content
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysContent.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaysContent.filter(c => c.status === 'live').length} currently live
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledContent.filter(c => 
                c.scheduledDate >= startOfWeek(new Date()) && 
                c.scheduledDate <= endOfWeek(new Date())
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledContent.filter(c => c.recurring?.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">Active series</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(scheduledContent.reduce((acc, c) => acc + c.duration, 0) / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">Content scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Schedule Calendar</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">Today</Button>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-background p-2 text-center text-sm font-medium">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, idx) => {
                  const dayDate = addDays(startOfWeek(new Date()), idx);
                  const dayContent = scheduledContent.filter(c =>
                    format(c.scheduledDate, 'yyyy-MM-dd') === format(dayDate, 'yyyy-MM-dd')
                  );
                  
                  return (
                    <div
                      key={idx}
                      className={`bg-background p-2 min-h-[100px] border ${
                        isToday(dayDate) ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(dayDate, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayContent.slice(0, 2).map(content => (
                          <div
                            key={content.id}
                            className="text-xs p-1 rounded bg-muted cursor-pointer hover:bg-muted/80"
                            onClick={() => setSelectedContent(content)}
                          >
                            <div className="flex items-center gap-1">
                              {getTypeIcon(content.type)}
                              <span className="truncate">{content.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayContent.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayContent.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {todaysContent.length > 0 ? (
                      todaysContent.map(content => (
                        <div key={content.id} className="flex items-start gap-3">
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(content.scheduledDate, 'HH:mm')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(content.type)}
                              <span className="font-medium text-sm">{content.title}</span>
                              <Badge variant={getStatusColor(content.status)}>
                                {content.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{content.duration} min</span>
                              <span>{content.visibility}</span>
                              {content.recurring?.enabled && (
                                <span className="flex items-center gap-1">
                                  <Repeat className="h-3 w-3" />
                                  {content.recurring.pattern}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No content scheduled for today
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {upcomingContent.map(content => (
                      <div key={content.id} className="flex items-start gap-3">
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(content.scheduledDate, 'MMM d')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(content.type)}
                            <span className="font-medium text-sm">{content.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{format(content.scheduledDate, 'HH:mm')}</span>
                            <span>{content.duration} min</span>
                            {content.notifications?.enabled && (
                              <span className="flex items-center gap-1">
                                <Bell className="h-3 w-3" />
                                {content.notifications.timing}m before
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => duplicateContent(content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Scheduled Content</CardTitle>
              <CardDescription>Manage all your scheduled content in one place</CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="content-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <div className="space-y-2">
                        {scheduledContent.map((content, index) => (
                          <Draggable
                            key={content.id}
                            draggableId={content.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="border rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                      {getTypeIcon(content.type)}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{content.title}</span>
                                        <Badge variant={getStatusColor(content.status)}>
                                          {content.status}
                                        </Badge>
                                        {content.recurring?.enabled && (
                                          <Badge variant="outline">
                                            <Repeat className="h-3 w-3 mr-1" />
                                            {content.recurring.pattern}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{format(content.scheduledDate, 'PPP p')}</span>
                                        <span>{content.duration} minutes</span>
                                        <span>{content.visibility}</span>
                                      </div>
                                      {content.description && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                          {content.description}
                                        </p>
                                      )}
                                      {content.tags && content.tags.length > 0 && (
                                        <div className="flex gap-1 mt-2">
                                          {content.tags.map((tag, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => duplicateContent(content)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => cancelContent(content.id)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Content Timeline</CardTitle>
              <CardDescription>Visual timeline of your scheduled content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-8">
                  {scheduledContent
                    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
                    .map((content, idx) => (
                      <div key={content.id} className="flex gap-4">
                        <div className="relative">
                          <div className={`w-4 h-4 rounded-full border-2 bg-background ${
                            content.status === 'live' ? 'border-destructive' :
                            content.status === 'completed' ? 'border-green-500' :
                            'border-primary'
                          }`} />
                          {idx < scheduledContent.length - 1 && (
                            <div className="absolute top-4 left-1.5 w-0.5 h-16 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">
                              {format(content.scheduledDate, 'PPP p')}
                            </span>
                            {isToday(content.scheduledDate) && (
                              <Badge variant="secondary">Today</Badge>
                            )}
                          </div>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    {getTypeIcon(content.type)}
                                    <span className="font-medium">{content.title}</span>
                                    <Badge variant={getStatusColor(content.status)}>
                                      {content.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{content.duration} minutes</span>
                                    <span>{content.visibility}</span>
                                    {content.recurring?.enabled && (
                                      <span className="flex items-center gap-1">
                                        <Repeat className="h-3 w-3" />
                                        {content.recurring.pattern}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Content</DialogTitle>
            <DialogDescription>
              Create a new scheduled content item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="content-title">Title</Label>
                <Input
                  id="content-title"
                  placeholder="Enter content title"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-type">Type</Label>
                <Select
                  value={newSchedule.type}
                  onValueChange={(v) => setNewSchedule({...newSchedule, type: v as "live" | "vod" | "premiere"})}
                >
                  <SelectTrigger id="content-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live Stream</SelectItem>
                    <SelectItem value="vod">Video on Demand</SelectItem>
                    <SelectItem value="premiere">Premiere</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Schedule Date & Time</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      defaultValue="14:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newSchedule.duration}
                      onChange={(e) => setNewSchedule({...newSchedule, duration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select
                      value={newSchedule.visibility}
                      onValueChange={(v) => setNewSchedule({...newSchedule, visibility: v as "public" | "private" | "unlisted"})}
                    >
                      <SelectTrigger id="visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter content description"
                value={newSchedule.description}
                onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Send reminders before the content goes live
                  </p>
                </div>
                <Switch
                  checked={newSchedule.notifications?.enabled}
                  onCheckedChange={(checked) => 
                    setNewSchedule({
                      ...newSchedule, 
                      notifications: {
                        ...newSchedule.notifications!,
                        enabled: checked
                      }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recurring Schedule</Label>
                  <p className="text-xs text-muted-foreground">
                    Repeat this content on a regular basis
                  </p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createSchedule}>
                Schedule Content
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentScheduler;