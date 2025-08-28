import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Check,
  Clock,
  Filter,
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  Star,
  Flag,
  User,
  Shield,
  TrendingUp,
  Archive,
  Eye,
  Settings,
  EyeOff,
  Pin,
  Trash2,
  Edit,
  Send,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  status: 'pending' | 'answered' | 'featured' | 'hidden';
  answer?: string;
  answeredBy?: string;
  answeredAt?: Date;
  isPinned?: boolean;
  isAnonymous?: boolean;
  tags?: string[];
  userVote?: 'up' | 'down' | null;
  followUpQuestions?: Question[];
}

interface QASettings {
  allowAnonymous: boolean;
  requireApproval: boolean;
  maxQuestionLength: number;
  votingEnabled: boolean;
  followUpEnabled: boolean;
  autoModeration: boolean;
  profanityFilter: boolean;
}

interface QAStats {
  totalQuestions: number;
  answeredQuestions: number;
  pendingQuestions: number;
  averageResponseTime: number;
  engagementRate: number;
  topAskers: Array<{ username: string; count: number }>;
}

interface QASystemProps {
  eventId: string;
  userId: string;
  username: string;
  isModeratorOrHost?: boolean;
  className?: string;
  onQuestionAnswered?: (question: Question) => void;
}

const QASystem: React.FC<QASystemProps> = ({
  eventId,
  userId,
  username,
  isModeratorOrHost = false,
  className,
  onQuestionAnswered
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'answered' | 'featured'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  const [showAnonymous, setShowAnonymous] = useState(false);
  const [settings, setSettings] = useState<QASettings>({
    allowAnonymous: true,
    requireApproval: false,
    maxQuestionLength: 500,
    votingEnabled: true,
    followUpEnabled: true,
    autoModeration: true,
    profanityFilter: true
  });
  const [stats, setStats] = useState<QAStats>({
    totalQuestions: 0,
    answeredQuestions: 0,
    pendingQuestions: 0,
    averageResponseTime: 0,
    engagementRate: 0,
    topAskers: []
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userQuestionCount, setUserQuestionCount] = useState(0);
  const [questionLimit] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags] = useState(['General', 'Technical', 'Product', 'Support', 'Feedback']);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      query: { eventId, userId }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Q&A server');
      socketInstance.emit('getQuestions');
      socketInstance.emit('getQASettings');
      socketInstance.emit('getQAStats');
    });

    socketInstance.on('questions', (data: Question[]) => {
      setQuestions(data);
    });

    socketInstance.on('newQuestion', (question: Question) => {
      setQuestions(prev => [question, ...prev]);
      updateStats('new');
    });

    socketInstance.on('questionUpdated', (question: Question) => {
      setQuestions(prev => prev.map(q => q.id === question.id ? question : q));
      if (question.status === 'answered' && onQuestionAnswered) {
        onQuestionAnswered(question);
      }
      updateStats('answered');
    });

    socketInstance.on('questionDeleted', (questionId: string) => {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    });

    socketInstance.on('qaSettings', (newSettings: QASettings) => {
      setSettings(newSettings);
    });

    socketInstance.on('qaStats', (newStats: QAStats) => {
      setStats(newStats);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [eventId, userId, onQuestionAnswered]);

  // Calculate user's question count
  useEffect(() => {
    const count = questions.filter(q => q.userId === userId && q.status !== 'hidden').length;
    setUserQuestionCount(count);
  }, [questions, userId]);

  const updateStats = useCallback((action: 'new' | 'answered') => {
    setStats(prev => ({
      ...prev,
      totalQuestions: action === 'new' ? prev.totalQuestions + 1 : prev.totalQuestions,
      pendingQuestions: action === 'new' ? prev.pendingQuestions + 1 : Math.max(0, prev.pendingQuestions - 1),
      answeredQuestions: action === 'answered' ? prev.answeredQuestions + 1 : prev.answeredQuestions
    }));
  }, []);

  const submitQuestion = useCallback(async () => {
    if (!socket || !questionInput.trim() || isSubmitting) return;

    if (userQuestionCount >= questionLimit && !isModeratorOrHost) {
      alert(`You have reached the maximum of ${questionLimit} questions.`);
      return;
    }

    if (questionInput.length > settings.maxQuestionLength) {
      alert(`Question is too long. Maximum ${settings.maxQuestionLength} characters.`);
      return;
    }

    setIsSubmitting(true);

    const question: Partial<Question> = {
      content: questionInput,
      isAnonymous: showAnonymous,
      tags: selectedTags,
      timestamp: new Date()
    };

    socket.emit('submitQuestion', question);
    setQuestionInput('');
    setShowAnonymous(false);
    setSelectedTags([]);
    setIsSubmitting(false);
  }, [socket, questionInput, showAnonymous, selectedTags, isSubmitting, userQuestionCount, questionLimit, isModeratorOrHost, settings.maxQuestionLength]);

  const voteQuestion = useCallback((questionId: string, voteType: 'up' | 'down') => {
    if (!socket || !settings.votingEnabled) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Toggle vote if same type, otherwise change vote
    const newVote = question.userVote === voteType ? null : voteType;
    
    socket.emit('voteQuestion', { questionId, voteType: newVote });
    
    // Optimistic update
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        let upvotes = q.upvotes;
        let downvotes = q.downvotes;
        
        // Remove previous vote
        if (q.userVote === 'up') upvotes--;
        if (q.userVote === 'down') downvotes--;
        
        // Add new vote
        if (newVote === 'up') upvotes++;
        if (newVote === 'down') downvotes++;
        
        return { ...q, upvotes, downvotes, userVote: newVote };
      }
      return q;
    }));
  }, [socket, questions, settings.votingEnabled]);

  const answerQuestion = useCallback((questionId: string) => {
    if (!socket || !answerInput.trim() || !isModeratorOrHost) return;

    socket.emit('answerQuestion', {
      questionId,
      answer: answerInput
    });

    setAnswerInput('');
    setSelectedQuestion(null);
  }, [socket, answerInput, isModeratorOrHost]);

  const toggleQuestionStatus = useCallback((questionId: string, status: Question['status']) => {
    if (!socket || !isModeratorOrHost) return;
    socket.emit('updateQuestionStatus', { questionId, status });
  }, [socket, isModeratorOrHost]);

  const togglePin = useCallback((questionId: string) => {
    if (!socket || !isModeratorOrHost) return;
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    socket.emit('togglePinQuestion', {
      questionId,
      isPinned: !question.isPinned
    });
  }, [socket, isModeratorOrHost, questions]);

  const deleteQuestion = useCallback((questionId: string) => {
    if (!socket || !isModeratorOrHost) return;
    if (confirm('Are you sure you want to delete this question?')) {
      socket.emit('deleteQuestion', questionId);
    }
  }, [socket, isModeratorOrHost]);

  const updateSettings = useCallback(() => {
    if (!socket || !isModeratorOrHost) return;
    socket.emit('updateQASettings', settings);
    setShowSettings(false);
  }, [socket, isModeratorOrHost, settings]);

  const exportQA = useCallback(() => {
    const qaData = questions.map(q => ({
      question: q.content,
      askedBy: q.isAnonymous ? 'Anonymous' : q.username,
      timestamp: new Date(q.timestamp).toLocaleString(),
      status: q.status,
      answer: q.answer || 'Not answered',
      answeredBy: q.answeredBy || '-',
      upvotes: q.upvotes,
      downvotes: q.downvotes
    }));

    const csv = [
      ['Question', 'Asked By', 'Timestamp', 'Status', 'Answer', 'Answered By', 'Upvotes', 'Downvotes'],
      ...qaData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-${eventId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [questions, eventId]);

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(q => {
      if (filterStatus !== 'all' && q.status !== filterStatus) return false;
      if (searchQuery && !q.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // Pinned questions always first
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      
      switch (sortBy) {
        case 'popular':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'unanswered':
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'newest':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  const renderQuestion = (question: Question) => {
    const isOwn = question.userId === userId;
    const score = question.upvotes - question.downvotes;

    return (
      <Card
        key={question.id}
        className={cn(
          "mb-3 transition-all hover:shadow-md",
          question.isPinned && "border-primary",
          question.status === 'featured' && "bg-primary/5",
          question.status === 'hidden' && "opacity-50"
        )}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Voting */}
            {settings.votingEnabled && (
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    question.userVote === 'up' && "text-primary"
                  )}
                  onClick={() => voteQuestion(question.id, 'up')}
                  disabled={!settings.votingEnabled}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                
                <span className={cn(
                  "text-sm font-semibold",
                  score > 0 && "text-primary",
                  score < 0 && "text-destructive"
                )}>
                  {score}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    question.userVote === 'down' && "text-destructive"
                  )}
                  onClick={() => voteQuestion(question.id, 'down')}
                  disabled={!settings.votingEnabled}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Question Content */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {!question.isAnonymous ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={question.avatar} />
                        <AvatarFallback>{question.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{question.username}</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Anonymous</span>
                    </div>
                  )}
                  
                  <span className="text-xs text-muted-foreground">
                    {new Date(question.timestamp).toLocaleTimeString()}
                  </span>
                  
                  {question.isPinned && (
                    <Badge variant="secondary" className="h-5">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  
                  {question.status === 'featured' && (
                    <Badge variant="default" className="h-5">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  
                  {question.status === 'answered' && (
                    <Badge variant="outline" className="h-5 text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Answered
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                {(isModeratorOrHost || isOwn) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isModeratorOrHost && (
                        <>
                          <DropdownMenuItem onClick={() => setSelectedQuestion(question)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Answer
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => togglePin(question.id)}>
                            <Pin className="h-4 w-4 mr-2" />
                            {question.isPinned ? 'Unpin' : 'Pin'}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => toggleQuestionStatus(question.id, 'featured')}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {question.status === 'featured' ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => toggleQuestionStatus(question.id, 
                              question.status === 'hidden' ? 'pending' : 'hidden'
                            )}
                          >
                            {question.status === 'hidden' ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {isOwn && (
                        <DropdownMenuItem onClick={() => {
                          setEditingQuestion(question.id);
                          setEditContent(question.content);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      
                      {(isModeratorOrHost || isOwn) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteQuestion(question.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Question Text */}
              {editingQuestion === question.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (socket) {
                          socket.emit('editQuestion', {
                            questionId: question.id,
                            content: editContent
                          });
                        }
                        setEditingQuestion(null);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingQuestion(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{question.content}</p>
              )}

              {/* Tags */}
              {question.tags && question.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {question.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Answer */}
              {question.answer && (
                <div className="mt-3 p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Answer</span>
                    {question.answeredBy && (
                      <span className="text-xs text-muted-foreground">
                        by {question.answeredBy}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{question.answer}</p>
                  {question.answeredAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(question.answeredAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Follow-up Questions */}
              {settings.followUpEnabled && question.followUpQuestions && question.followUpQuestions.length > 0 && (
                <div className="ml-4 mt-3 space-y-2 border-l-2 pl-4">
                  <span className="text-xs font-medium text-muted-foreground">Follow-up Questions:</span>
                  {question.followUpQuestions.map(followUp => (
                    <div key={followUp.id} className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{followUp.username}:</span>
                        <span>{followUp.content}</span>
                      </div>
                      {followUp.answer && (
                        <div className="ml-4 text-muted-foreground">
                          → {followUp.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Q&A</h3>
              <Badge variant="outline">
                {stats.totalQuestions} questions
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Stats */}
              {isModeratorOrHost && (
                <Dialog open={showStats} onOpenChange={setShowStats}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Q&A Statistics</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Total Questions</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Answered</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                              {stats.answeredQuestions}
                            </p>
                            <Progress 
                              value={(stats.answeredQuestions / Math.max(stats.totalQuestions, 1)) * 100}
                              className="mt-2 h-2"
                            />
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Pending</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-yellow-600">
                              {stats.pendingQuestions}
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Engagement</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">
                              {(stats.engagementRate * 100).toFixed(1)}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {stats.topAskers.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Top Participants</h4>
                          <div className="space-y-2">
                            {stats.topAskers.map((asker, index) => (
                              <div key={asker.username} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant={index === 0 ? "default" : "outline"}>
                                    #{index + 1}
                                  </Badge>
                                  <span>{asker.username}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {asker.count} questions
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Settings */}
              {isModeratorOrHost && (
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Q&A Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="anonymous">Allow Anonymous</Label>
                        <Switch
                          id="anonymous"
                          checked={settings.allowAnonymous}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, allowAnonymous: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="approval">Require Approval</Label>
                        <Switch
                          id="approval"
                          checked={settings.requireApproval}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, requireApproval: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="voting">Enable Voting</Label>
                        <Switch
                          id="voting"
                          checked={settings.votingEnabled}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, votingEnabled: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="followup">Allow Follow-ups</Label>
                        <Switch
                          id="followup"
                          checked={settings.followUpEnabled}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, followUpEnabled: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="profanity">Profanity Filter</Label>
                        <Switch
                          id="profanity"
                          checked={settings.profanityFilter}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, profanityFilter: checked }))
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Max Question Length</Label>
                        <Input
                          type="number"
                          value={settings.maxQuestionLength}
                          onChange={(e) => 
                            setSettings(prev => ({ 
                              ...prev, 
                              maxQuestionLength: parseInt(e.target.value) 
                            }))
                          }
                          min={50}
                          max={1000}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={updateSettings}>Save Settings</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Export */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={exportQA}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Q&A</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Questions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="unanswered">Unanswered First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Questions List */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-2" />
              <p>No questions yet</p>
              <p className="text-sm">Be the first to ask!</p>
            </div>
          ) : (
            filteredQuestions.map(renderQuestion)
          )}
        </ScrollArea>

        {/* Submit Question */}
        <div className="p-4 border-t space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Ask a question..."
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                className="min-h-[60px] resize-none"
                maxLength={settings.maxQuestionLength}
                disabled={userQuestionCount >= questionLimit && !isModeratorOrHost}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.allowAnonymous && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="anonymous-submit"
                        checked={showAnonymous}
                        onCheckedChange={setShowAnonymous}
                      />
                      <Label htmlFor="anonymous-submit" className="text-sm">
                        Ask anonymously
                      </Label>
                    </div>
                  )}
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Flag className="h-3 w-3 mr-1" />
                        Tags ({selectedTags.length})
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Select Tags</p>
                        {availableTags.map(tag => (
                          <div key={tag} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTags(prev => [...prev, tag]);
                                } else {
                                  setSelectedTags(prev => prev.filter(t => t !== tag));
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                              {tag}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {questionInput.length}/{settings.maxQuestionLength}
                  </span>
                  
                  {!isModeratorOrHost && (
                    <span className="text-xs text-muted-foreground">
                      {userQuestionCount}/{questionLimit} questions
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              onClick={submitQuestion}
              disabled={
                !questionInput.trim() || 
                isSubmitting ||
                (userQuestionCount >= questionLimit && !isModeratorOrHost)
              }
              className="self-start mt-2"
            >
              {isSubmitting ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Answer Modal */}
        <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Answer Question</DialogTitle>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedQuestion.avatar} />
                      <AvatarFallback>{selectedQuestion.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{selectedQuestion.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedQuestion.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{selectedQuestion.content}</p>
                </div>
                
                <Textarea
                  placeholder="Type your answer..."
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  className="min-h-[100px]"
                />
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedQuestion(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => answerQuestion(selectedQuestion.id)}
                    disabled={!answerInput.trim()}
                  >
                    Submit Answer
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default QASystem;