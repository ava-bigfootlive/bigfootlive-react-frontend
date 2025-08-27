/**
 * Breakout Rooms Component for BigFootLive WebRTC
 * 
 * Features:
 * - Breakout room creation interface
 * - Drag-and-drop participant assignment
 * - Room management dashboard for moderators
 * - Countdown timers and notifications
 * - Quick navigation between rooms
 * - Automated assignment algorithms
 * - Room analytics and monitoring
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import {
  Users,
  Plus,
  Settings,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  Target,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Timer,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  UserPlus,
  UserMinus,
  Eye,
  MessageSquare,
  Mic,
  Video
} from 'lucide-react';
import { useWebRTC, WebRTCPeer, WebRTCRoom } from '@/hooks/useWebRTC';
import { cn } from '@/lib/utils';

interface BreakoutRoomsProps {
  mainRoomId: string;
  eventId: string;
  userId: string;
  role: 'moderator' | 'admin' | 'attendee';
  className?: string;
  onError?: (error: string) => void;
  onRoomChange?: (roomId: string) => void;
}

interface BreakoutRoom {
  id: string;
  name: string;
  participantCount: number;
  maxParticipants: number;
  timeRemaining?: number;
  status: 'created' | 'active' | 'ending' | 'merged' | 'closed';
  participants: WebRTCPeer[];
  features: {
    allowScreenShare: boolean;
    enableChat: boolean;
    enableRecording: boolean;
  };
  analytics: {
    messagesCount: number;
    engagementScore: number;
    averageStayTime: number;
  };
}

interface AssignmentAlgorithm {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const ASSIGNMENT_ALGORITHMS: AssignmentAlgorithm[] = [
  {
    id: 'manual',
    name: 'Manual Assignment',
    description: 'Manually assign participants to rooms',
    icon: <UserPlus className="w-4 h-4" />
  },
  {
    id: 'random',
    name: 'Random',
    description: 'Randomly distribute participants',
    icon: <Shuffle className="w-4 h-4" />
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Evenly balance room sizes',
    icon: <Target className="w-4 h-4" />
  },
  {
    id: 'round_robin',
    name: 'Round Robin',
    description: 'Distribute participants in sequence',
    icon: <RotateCcw className="w-4 h-4" />
  }
];

// Room timer component
const RoomTimer: React.FC<{
  timeRemaining: number;
  isActive: boolean;
  onExtend?: () => void;
  onEnd?: () => void;
}> = ({ timeRemaining, isActive, onExtend, onEnd }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = timeRemaining > 0 ? (timeRemaining / (30 * 60)) * 100 : 0; // Assuming 30 min default
  
  const isWarning = timeRemaining <= 300; // 5 minutes
  const isCritical = timeRemaining <= 60; // 1 minute
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
        isCritical ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
        isWarning ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" :
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      )}>
        <Timer className="w-3 h-3" />
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      {progress > 0 && (
        <Progress 
          value={progress} 
          className={cn(
            "w-16 h-2",
            isCritical ? "text-red-600" :
            isWarning ? "text-yellow-600" :
            "text-green-600"
          )}
        />
      )}
      
      {(isWarning || isCritical) && onExtend && (
        <Button size="sm" variant="outline" onClick={onExtend}>
          +5min
        </Button>
      )}
    </div>
  );
};

// Participant card component for drag and drop
const ParticipantCard: React.FC<{
  participant: WebRTCPeer;
  index: number;
  isDragging?: boolean;
}> = ({ participant, index, isDragging }) => {
  return (
    <Draggable draggableId={participant.peerId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border rounded-md transition-all",
            snapshot.isDragging && "shadow-lg rotate-2 scale-105",
            "hover:shadow-sm cursor-move"
          )}
        >
          <div className="flex-shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
              participant.role === 'moderator' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" :
              participant.role === 'admin' ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" :
              "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            )}>
              {participant.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {participant.displayName}
            </p>
            <div className="flex items-center gap-1">
              {participant.role !== 'attendee' && (
                <Badge variant="outline" className="text-xs">
                  {participant.role}
                </Badge>
              )}
              <div className="flex gap-1">
                {participant.audioEnabled ? (
                  <Mic className="w-3 h-3 text-green-500" />
                ) : (
                  <Mic className="w-3 h-3 text-gray-400" />
                )}
                {participant.videoEnabled ? (
                  <Video className="w-3 h-3 text-green-500" />
                ) : (
                  <Video className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Breakout room card component
const BreakoutRoomCard: React.FC<{
  room: BreakoutRoom;
  participants: WebRTCPeer[];
  onJoin?: (roomId: string) => void;
  onManage?: (roomId: string) => void;
  onEnd?: (roomId: string) => void;
  canManage?: boolean;
}> = ({ room, participants, onJoin, onManage, onEnd, canManage }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'ending': return 'bg-yellow-500';
      case 'created': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'ending': return 'Ending';
      case 'created': return 'Created';
      case 'merged': return 'Merged';
      case 'closed': return 'Closed';
      default: return status;
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium truncate">
            {room.name}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              getStatusColor(room.status)
            )} />
            <Badge variant="outline" className="text-xs">
              {getStatusText(room.status)}
            </Badge>
          </div>
        </div>
        
        {room.timeRemaining !== undefined && (
          <RoomTimer
            timeRemaining={room.timeRemaining}
            isActive={room.status === 'active'}
          />
        )}
      </CardHeader>
      
      <CardContent>
        <Droppable droppableId={room.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "min-h-[120px] p-2 border-2 border-dashed rounded-md transition-colors",
                snapshot.isDraggingOver 
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" 
                  : "border-gray-300 dark:border-gray-600"
              )}
            >
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <ParticipantCard
                    key={participant.peerId}
                    participant={participant}
                    index={index}
                  />
                ))}
                
                {participants.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Users className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drop participants here
                    </p>
                  </div>
                )}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{participants.length}/{room.maxParticipants} participants</span>
          
          <div className="flex items-center gap-2">
            {room.analytics.messagesCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {room.analytics.messagesCount}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {room.analytics.messagesCount} messages sent
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {room.analytics.engagementScore.toFixed(1)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Engagement score: {room.analytics.engagementScore.toFixed(1)}/10
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          {room.status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onJoin?.(room.id)}
              className="flex-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              Join
            </Button>
          )}
          
          {canManage && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onManage?.(room.id)}
              >
                <Settings className="w-3 h-3 mr-1" />
                Manage
              </Button>
              
              {room.status === 'active' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onEnd?.(room.id)}
                >
                  End
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main BreakoutRooms component
export const BreakoutRooms: React.FC<BreakoutRoomsProps> = ({
  mainRoomId,
  eventId,
  userId,
  role,
  className,
  onError,
  onRoomChange
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);
  const [unassignedParticipants, setUnassignedParticipants] = useState<WebRTCPeer[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('balanced');
  const [roomCount, setRoomCount] = useState(3);
  const [roomDuration, setRoomDuration] = useState(30);
  const [roomNamePrefix, setRoomNamePrefix] = useState('Breakout Room');
  
  // Mock data - would come from WebRTC service
  const mockParticipants: WebRTCPeer[] = [
    {
      peerId: '1',
      userId: 'user1',
      displayName: 'Alice Johnson',
      role: 'attendee',
      isPresenting: false,
      isScreenSharing: false,
      audioEnabled: true,
      videoEnabled: true,
      connectionQuality: 'good'
    },
    {
      peerId: '2',
      userId: 'user2',
      displayName: 'Bob Smith',
      role: 'attendee',
      isPresenting: false,
      isScreenSharing: false,
      audioEnabled: true,
      videoEnabled: false,
      connectionQuality: 'excellent'
    },
    {
      peerId: '3',
      userId: 'user3',
      displayName: 'Carol Davis',
      role: 'moderator',
      isPresenting: true,
      isScreenSharing: false,
      audioEnabled: true,
      videoEnabled: true,
      connectionQuality: 'good'
    }
  ];
  
  useEffect(() => {
    setUnassignedParticipants(mockParticipants);
  }, []);
  
  const canManage = role === 'moderator' || role === 'admin';
  
  // Handle drag and drop
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    
    // Find the participant being moved
    const participant = [...unassignedParticipants, ...breakoutRooms.flatMap(r => r.participants)]
      .find(p => p.peerId === draggableId);
    
    if (!participant) return;
    
    // Remove participant from source
    if (source.droppableId === 'unassigned') {
      setUnassignedParticipants(prev => prev.filter(p => p.peerId !== draggableId));
    } else {
      setBreakoutRooms(prev => prev.map(room => 
        room.id === source.droppableId
          ? { ...room, participants: room.participants.filter(p => p.peerId !== draggableId) }
          : room
      ));
    }
    
    // Add participant to destination
    if (destination.droppableId === 'unassigned') {
      setUnassignedParticipants(prev => {
        const newList = [...prev];
        newList.splice(destination.index, 0, participant);
        return newList;
      });
    } else {
      setBreakoutRooms(prev => prev.map(room => 
        room.id === destination.droppableId
          ? { ...room, participants: [...room.participants.slice(0, destination.index), participant, ...room.participants.slice(destination.index)] }
          : room
      ));
    }
  }, [unassignedParticipants, breakoutRooms]);
  
  // Create breakout rooms
  const handleCreateBreakoutRooms = useCallback(async () => {
    if (!canManage) return;
    
    try {
      const newRooms: BreakoutRoom[] = [];
      
      for (let i = 0; i < roomCount; i++) {
        newRooms.push({
          id: `breakout_${Date.now()}_${i}`,
          name: `${roomNamePrefix} ${i + 1}`,
          participantCount: 0,
          maxParticipants: 20,
          timeRemaining: roomDuration * 60,
          status: 'created',
          participants: [],
          features: {
            allowScreenShare: true,
            enableChat: true,
            enableRecording: false
          },
          analytics: {
            messagesCount: 0,
            engagementScore: 0,
            averageStayTime: 0
          }
        });
      }
      
      setBreakoutRooms(newRooms);
      
      // Auto-assign participants based on selected algorithm
      if (selectedAlgorithm !== 'manual') {
        await handleAutoAssignment(selectedAlgorithm, newRooms);
      }
      
      setShowCreateDialog(false);
      
    } catch (error) {
      console.error('Failed to create breakout rooms:', error);
      onError?.(`Failed to create breakout rooms: ${error}`);
    }
  }, [canManage, roomCount, roomNamePrefix, roomDuration, selectedAlgorithm, onError]);
  
  // Auto-assign participants
  const handleAutoAssignment = useCallback(async (algorithm: string, rooms: BreakoutRoom[]) => {
    const participants = [...unassignedParticipants];
    if (participants.length === 0) return;
    
    let assignments: { [roomId: string]: WebRTCPeer[] } = {};
    
    switch (algorithm) {
      case 'random':
        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        shuffled.forEach((participant, index) => {
          const roomId = rooms[index % rooms.length].id;
          if (!assignments[roomId]) assignments[roomId] = [];
          assignments[roomId].push(participant);
        });
        break;
        
      case 'balanced':
        const participantsPerRoom = Math.floor(participants.length / rooms.length);
        const remainder = participants.length % rooms.length;
        
        let participantIndex = 0;
        rooms.forEach((room, roomIndex) => {
          assignments[room.id] = [];
          const roomSize = participantsPerRoom + (roomIndex < remainder ? 1 : 0);
          
          for (let i = 0; i < roomSize && participantIndex < participants.length; i++) {
            assignments[room.id].push(participants[participantIndex++]);
          }
        });
        break;
        
      case 'round_robin':
        participants.forEach((participant, index) => {
          const roomId = rooms[index % rooms.length].id;
          if (!assignments[roomId]) assignments[roomId] = [];
          assignments[roomId].push(participant);
        });
        break;
    }
    
    // Apply assignments
    setBreakoutRooms(prev => prev.map(room => ({
      ...room,
      participants: assignments[room.id] || []
    })));
    
    setUnassignedParticipants([]);
  }, [unassignedParticipants]);
  
  // Start breakout rooms
  const handleStartBreakoutRooms = useCallback(async () => {
    if (!canManage) return;
    
    try {
      setBreakoutRooms(prev => prev.map(room => ({
        ...room,
        status: 'active' as const
      })));
      
      // Start timers
      const interval = setInterval(() => {
        setBreakoutRooms(prev => prev.map(room => ({
          ...room,
          timeRemaining: Math.max(0, (room.timeRemaining || 0) - 1)
        })));
      }, 1000);
      
      // Auto-end rooms when time is up
      setTimeout(() => {
        clearInterval(interval);
        handleEndAllBreakoutRooms();
      }, roomDuration * 60 * 1000);
      
    } catch (error) {
      console.error('Failed to start breakout rooms:', error);
      onError?.(`Failed to start breakout rooms: ${error}`);
    }
  }, [canManage, roomDuration, onError]);
  
  // End all breakout rooms
  const handleEndAllBreakoutRooms = useCallback(async () => {
    if (!canManage) return;
    
    try {
      setBreakoutRooms(prev => prev.map(room => ({
        ...room,
        status: 'merged' as const
      })));
      
      // Move all participants back to unassigned
      const allParticipants = breakoutRooms.flatMap(room => room.participants);
      setUnassignedParticipants(prev => [...prev, ...allParticipants]);
      
      setBreakoutRooms(prev => prev.map(room => ({
        ...room,
        participants: []
      })));
      
    } catch (error) {
      console.error('Failed to end breakout rooms:', error);
      onError?.(`Failed to end breakout rooms: ${error}`);
    }
  }, [canManage, breakoutRooms, onError]);
  
  // Join breakout room
  const handleJoinBreakoutRoom = useCallback((roomId: string) => {
    onRoomChange?.(roomId);
  }, [onRoomChange]);
  
  return (
    <div className={cn("w-full h-full p-4", className)}>
      <div className="flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Breakout Rooms</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and participate in breakout room sessions
            </p>
          </div>
          
          {canManage && (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateDialog(true)}
                disabled={breakoutRooms.length > 0 && breakoutRooms.some(r => r.status === 'active')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Rooms
              </Button>
              
              {breakoutRooms.length > 0 && breakoutRooms.every(r => r.status === 'created') && (
                <Button onClick={handleStartBreakoutRooms} variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Start All
                </Button>
              )}
              
              {breakoutRooms.some(r => r.status === 'active') && (
                <Button onClick={handleEndAllBreakoutRooms} variant="destructive">
                  <Pause className="w-4 h-4 mr-2" />
                  End All
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Main content */}
        {breakoutRooms.length === 0 ? (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Breakout Rooms</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {canManage 
                  ? "Create breakout rooms to enable small group discussions and activities."
                  : "Wait for a moderator to create breakout rooms."
                }
              </p>
              {canManage && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Breakout Rooms
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 flex gap-4">
              {/* Unassigned participants */}
              {canManage && (
                <Card className="w-80 flex-shrink-0">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Unassigned Participants ({unassignedParticipants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="unassigned">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "min-h-[200px] space-y-2 p-2 border-2 border-dashed rounded-md",
                            snapshot.isDraggingOver 
                              ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" 
                              : "border-gray-300 dark:border-gray-600"
                          )}
                        >
                          {unassignedParticipants.map((participant, index) => (
                            <ParticipantCard
                              key={participant.peerId}
                              participant={participant}
                              index={index}
                            />
                          ))}
                          {unassignedParticipants.length === 0 && (
                            <div className="flex items-center justify-center py-8 text-center">
                              <div>
                                <Users className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  All participants assigned
                                </p>
                              </div>
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              )}
              
              {/* Breakout rooms grid */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-fit">
                  {breakoutRooms.map(room => (
                    <BreakoutRoomCard
                      key={room.id}
                      room={room}
                      participants={room.participants}
                      onJoin={handleJoinBreakoutRoom}
                      canManage={canManage}
                    />
                  ))}
                </div>
              </div>
            </div>
          </DragDropContext>
        )}
        
        {/* Create breakout rooms dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Breakout Rooms</DialogTitle>
              <DialogDescription>
                Configure and create breakout rooms for small group discussions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomCount">Number of Rooms</Label>
                  <Select value={roomCount.toString()} onValueChange={(v) => setRoomCount(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 8, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} rooms
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={roomDuration.toString()} onValueChange={(v) => setRoomDuration(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 30, 45, 60].map(mins => (
                        <SelectItem key={mins} value={mins.toString()}>
                          {mins} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="namePrefix">Room Name Prefix</Label>
                <Input
                  id="namePrefix"
                  value={roomNamePrefix}
                  onChange={(e) => setRoomNamePrefix(e.target.value)}
                  placeholder="Breakout Room"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Assignment Algorithm</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ASSIGNMENT_ALGORITHMS.map(algorithm => (
                    <Card
                      key={algorithm.id}
                      className={cn(
                        "p-3 cursor-pointer transition-colors",
                        selectedAlgorithm === algorithm.id 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => setSelectedAlgorithm(algorithm.id)}
                    >
                      <div className="flex items-center gap-2">
                        {algorithm.icon}
                        <div>
                          <div className="font-medium text-sm">{algorithm.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {algorithm.description}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBreakoutRooms}>
                Create {roomCount} Rooms
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};