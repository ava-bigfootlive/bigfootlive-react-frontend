import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Vote,
  Plus,
  Trash2,
  Play,
  Pause,
  Square,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Download,
  Settings,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Zap,
  Trophy,
  Target,
  Timer,
  Lock,
  Unlock,
  RefreshCw,
  Send,
  Edit,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  MessageSquare,
  Heart,
  ThumbsUp,
  Star
} from 'lucide-react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { cn } from '@/lib/utils';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  voters: string[];
  color: string;
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  type: 'single' | 'multiple' | 'rating' | 'ranking';
  status: 'draft' | 'active' | 'paused' | 'ended';
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  totalVotes: number;
  uniqueVoters: number;
  allowAnonymous: boolean;
  showResults: 'live' | 'after' | 'never';
  allowChangeVote: boolean;
  requireAuth: boolean;
  maxVotesPerUser?: number;
  tags: string[];
  targetAudience?: string;
}

interface VoteActivity {
  timestamp: Date;
  userId: string;
  userName: string;
  pollId: string;
  optionId: string;
  action: 'voted' | 'changed' | 'removed';
}

interface PollTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  question: string;
  options: string[];
  type: Poll['type'];
}

const POLL_TEMPLATES: PollTemplate[] = [
  {
    id: '1',
    name: 'Yes/No',
    icon: CheckCircle,
    description: 'Simple binary choice',
    question: 'Do you agree?',
    options: ['Yes', 'No'],
    type: 'single'
  },
  {
    id: '2',
    name: 'Rating',
    icon: Star,
    description: 'Rate from 1 to 5',
    question: 'How would you rate this?',
    options: ['1', '2', '3', '4', '5'],
    type: 'rating'
  },
  {
    id: '3',
    name: 'Multiple Choice',
    icon: Target,
    description: 'Choose one option',
    question: 'What is your preference?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    type: 'single'
  },
  {
    id: '4',
    name: 'Feedback',
    icon: MessageSquare,
    description: 'Collect feedback',
    question: 'How was your experience?',
    options: ['Excellent', 'Good', 'Average', 'Poor'],
    type: 'single'
  },
  {
    id: '5',
    name: 'Priority',
    icon: ArrowUp,
    description: 'Rank by importance',
    question: 'Rank these features',
    options: ['Feature 1', 'Feature 2', 'Feature 3'],
    type: 'ranking'
  }
];

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
];

export default function LivePolls() {
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: '1',
      question: 'What topic should we cover next?',
      description: 'Help us decide the next webinar topic',
      options: [
        { id: '1', text: 'Advanced React Patterns', votes: 145, percentage: 35, voters: [], color: COLORS[0] },
        { id: '2', text: 'State Management Deep Dive', votes: 98, percentage: 24, voters: [], color: COLORS[1] },
        { id: '3', text: 'Performance Optimization', votes: 112, percentage: 27, voters: [], color: COLORS[2] },
        { id: '4', text: 'Testing Strategies', votes: 58, percentage: 14, voters: [], color: COLORS[3] }
      ],
      type: 'single',
      status: 'active',
      createdAt: new Date(Date.now() - 3600000),
      startedAt: new Date(Date.now() - 1800000),
      totalVotes: 413,
      uniqueVoters: 382,
      allowAnonymous: true,
      showResults: 'live',
      allowChangeVote: true,
      requireAuth: false,
      tags: ['webinar', 'education'],
      targetAudience: 'All viewers'
    },
    {
      id: '2',
      question: 'Rate the stream quality',
      options: [
        { id: '1', text: '⭐', votes: 12, percentage: 5, voters: [], color: COLORS[0] },
        { id: '2', text: '⭐⭐', votes: 18, percentage: 7, voters: [], color: COLORS[1] },
        { id: '3', text: '⭐⭐⭐', votes: 45, percentage: 18, voters: [], color: COLORS[2] },
        { id: '4', text: '⭐⭐⭐⭐', votes: 89, percentage: 36, voters: [], color: COLORS[3] },
        { id: '5', text: '⭐⭐⭐⭐⭐', votes: 84, percentage: 34, voters: [], color: COLORS[4] }
      ],
      type: 'rating',
      status: 'active',
      createdAt: new Date(Date.now() - 7200000),
      startedAt: new Date(Date.now() - 3600000),
      totalVotes: 248,
      uniqueVoters: 248,
      allowAnonymous: true,
      showResults: 'live',
      allowChangeVote: false,
      requireAuth: false,
      tags: ['feedback', 'quality'],
      targetAudience: 'All viewers'
    }
  ]);

  const [activePoll, setActivePoll] = useState<Poll | null>(polls[0]);
  const [selectedPollId, setSelectedPollId] = useState<string>(polls[0].id);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PollTemplate | null>(null);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [newPoll, setNewPoll] = useState<Partial<Poll>>({
    question: '',
    description: '',
    options: [
      { id: '1', text: '', votes: 0, percentage: 0, voters: [], color: COLORS[0] },
      { id: '2', text: '', votes: 0, percentage: 0, voters: [], color: COLORS[1] }
    ],
    type: 'single',
    allowAnonymous: true,
    showResults: 'live',
    allowChangeVote: true,
    requireAuth: false,
    tags: []
  });

  const [voteActivity, setVoteActivity] = useState<VoteActivity[]>([
    {
      timestamp: new Date(Date.now() - 60000),
      userId: '1',
      userName: 'John Doe',
      pollId: '1',
      optionId: '1',
      action: 'voted'
    },
    {
      timestamp: new Date(Date.now() - 120000),
      userId: '2',
      userName: 'Jane Smith',
      pollId: '1',
      optionId: '2',
      action: 'voted'
    }
  ]);

  // Simulate real-time voting
  useEffect(() => {
    if (activePoll?.status === 'active') {
      pollIntervalRef.current = setInterval(() => {
        setPolls(prev => prev.map(poll => {
          if (poll.status === 'active') {
            const randomOptionIndex = Math.floor(Math.random() * poll.options.length);
            const updatedOptions = poll.options.map((option, index) => {
              if (index === randomOptionIndex) {
                const newVotes = option.votes + Math.floor(Math.random() * 3);
                return { ...option, votes: newVotes };
              }
              return option;
            });

            const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);
            const optionsWithPercentage = updatedOptions.map(option => ({
              ...option,
              percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
            }));

            return {
              ...poll,
              options: optionsWithPercentage,
              totalVotes,
              uniqueVoters: Math.floor(totalVotes * 0.92)
            };
          }
          return poll;
        }));

        // Update active poll if it exists
        if (activePoll) {
          const updated = polls.find(p => p.id === activePoll.id);
          if (updated) setActivePoll(updated);
        }
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [activePoll?.status, polls]);

  const startPoll = (pollId: string) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? { ...poll, status: 'active' as const, startedAt: new Date() }
        : poll
    ));
    toast.success('Poll started');
  };

  const pausePoll = (pollId: string) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? { ...poll, status: 'paused' as const }
        : poll
    ));
    toast.info('Poll paused');
  };

  const endPoll = (pollId: string) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? { ...poll, status: 'ended' as const, endedAt: new Date() }
        : poll
    ));
    toast.info('Poll ended');
  };

  const deletePoll = (pollId: string) => {
    setPolls(prev => prev.filter(poll => poll.id !== pollId));
    if (activePoll?.id === pollId) {
      setActivePoll(null);
    }
    toast.success('Poll deleted');
  };

  const vote = (pollId: string, optionId: string) => {
    if (votedPolls.has(pollId)) {
      toast.error('You have already voted in this poll');
      return;
    }

    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(option => {
          if (option.id === optionId) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });

        const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);
        const optionsWithPercentage = updatedOptions.map(option => ({
          ...option,
          percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
        }));

        return {
          ...poll,
          options: optionsWithPercentage,
          totalVotes,
          uniqueVoters: poll.uniqueVoters + 1
        };
      }
      return poll;
    }));

    setVotedPolls(prev => new Set(prev).add(pollId));
    setSelectedOptions(prev => new Set(prev).add(optionId));
    
    // Add to activity
    setVoteActivity(prev => [{
      timestamp: new Date(),
      userId: 'current',
      userName: 'You',
      pollId,
      optionId,
      action: 'voted'
    }, ...prev]);

    toast.success('Vote recorded!');
  };

  const createPoll = () => {
    if (!newPoll.question || newPoll.options?.filter(o => o.text).length < 2) {
      toast.error('Please provide a question and at least 2 options');
      return;
    }

    const poll: Poll = {
      id: Date.now().toString(),
      question: newPoll.question!,
      description: newPoll.description,
      options: newPoll.options!.filter(o => o.text).map((o, i) => ({
        ...o,
        id: (i + 1).toString(),
        votes: 0,
        percentage: 0,
        voters: [],
        color: COLORS[i % COLORS.length]
      })),
      type: newPoll.type as Poll['type'],
      status: 'draft',
      createdAt: new Date(),
      totalVotes: 0,
      uniqueVoters: 0,
      allowAnonymous: newPoll.allowAnonymous!,
      showResults: newPoll.showResults as Poll['showResults'],
      allowChangeVote: newPoll.allowChangeVote!,
      requireAuth: newPoll.requireAuth!,
      tags: newPoll.tags || []
    };

    setPolls(prev => [poll, ...prev]);
    setIsCreating(false);
    setNewPoll({
      question: '',
      description: '',
      options: [
        { id: '1', text: '', votes: 0, percentage: 0, voters: [], color: COLORS[0] },
        { id: '2', text: '', votes: 0, percentage: 0, voters: [], color: COLORS[1] }
      ],
      type: 'single',
      allowAnonymous: true,
      showResults: 'live',
      allowChangeVote: true,
      requireAuth: false,
      tags: []
    });
    toast.success('Poll created successfully');
  };

  const addOption = () => {
    if (newPoll.options!.length >= 8) {
      toast.error('Maximum 8 options allowed');
      return;
    }
    setNewPoll(prev => ({
      ...prev,
      options: [
        ...prev.options!,
        {
          id: (prev.options!.length + 1).toString(),
          text: '',
          votes: 0,
          percentage: 0,
          voters: [],
          color: COLORS[prev.options!.length % COLORS.length]
        }
      ]
    }));
  };

  const removeOption = (index: number) => {
    if (newPoll.options!.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    setNewPoll(prev => ({
      ...prev,
      options: prev.options!.filter((_, i) => i !== index)
    }));
  };

  const applyTemplate = (template: PollTemplate) => {
    setNewPoll({
      question: template.question,
      description: template.description,
      options: template.options.map((text, i) => ({
        id: (i + 1).toString(),
        text,
        votes: 0,
        percentage: 0,
        voters: [],
        color: COLORS[i % COLORS.length]
      })),
      type: template.type,
      allowAnonymous: true,
      showResults: 'live',
      allowChangeVote: true,
      requireAuth: false,
      tags: []
    });
    setSelectedTemplate(template);
  };

  const exportResults = (poll: Poll) => {
    const data = {
      poll: {
        question: poll.question,
        description: poll.description,
        type: poll.type,
        totalVotes: poll.totalVotes,
        uniqueVoters: poll.uniqueVoters,
        createdAt: poll.createdAt,
        startedAt: poll.startedAt,
        endedAt: poll.endedAt
      },
      results: poll.options.map(option => ({
        option: option.text,
        votes: option.votes,
        percentage: option.percentage
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poll-results-${poll.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Results exported');
  };

  const sharePoll = (poll: Poll) => {
    const url = `${window.location.origin}/poll/${poll.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Poll link copied to clipboard');
  };

  const getStatusColor = (status: Poll['status']) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      case 'ended': return 'text-gray-500';
      default: return 'text-blue-500';
    }
  };

  const getStatusBadge = (status: Poll['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Paused</Badge>;
      case 'ended':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Ended</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <DashboardLayout title="Live Polls">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Polls</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage interactive polls for audience engagement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Users className="h-3 w-3 mr-1" />
              {polls.reduce((sum, p) => sum + p.uniqueVoters, 0)} Total Voters
            </Badge>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Polls List */}
          <div className="xl:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Polls</CardTitle>
                <CardDescription>Manage your live polls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {polls.map((poll) => (
                    <div
                      key={poll.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedPollId === poll.id && "bg-accent border-accent-foreground/20"
                      )}
                      onClick={() => {
                        setSelectedPollId(poll.id);
                        setActivePoll(poll);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-2">{poll.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(poll.status)}
                            <span className="text-xs text-muted-foreground">
                              {poll.totalVotes} votes
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePoll(poll.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex gap-1">
                        {poll.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              startPoll(poll.id);
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {poll.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                pausePoll(poll.id);
                              }}
                            >
                              <Pause className="h-3 w-3 mr-1" />
                              Pause
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                endPoll(poll.id);
                              }}
                            >
                              <Square className="h-3 w-3 mr-1" />
                              End
                            </Button>
                          </>
                        )}
                        {poll.status === 'paused' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                startPoll(poll.id);
                              }}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Resume
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                endPoll(poll.id);
                              }}
                            >
                              <Square className="h-3 w-3 mr-1" />
                              End
                            </Button>
                          </>
                        )}
                        {poll.status === 'ended' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportResults(poll);
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vote Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {voteActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5",
                        activity.action === 'voted' ? 'bg-green-500' :
                        activity.action === 'changed' ? 'bg-yellow-500' :
                        'bg-red-500'
                      )} />
                      <div className="flex-1">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">{activity.userName}</span>
                          {' '}
                          {activity.action === 'voted' ? 'voted in' :
                           activity.action === 'changed' ? 'changed vote in' :
                           'removed vote from'}
                          {' '}
                          poll
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Poll Display */}
          <div className="xl:col-span-2 space-y-4">
            {activePoll ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{activePoll.question}</CardTitle>
                        {activePoll.description && (
                          <CardDescription className="mt-2">
                            {activePoll.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => sharePoll(activePoll)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => exportResults(activePoll)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      {getStatusBadge(activePoll.status)}
                      <Badge variant="outline">
                        <Vote className="h-3 w-3 mr-1" />
                        {activePoll.totalVotes} votes
                      </Badge>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {activePoll.uniqueVoters} voters
                      </Badge>
                      {activePoll.startedAt && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor((Date.now() - activePoll.startedAt.getTime()) / 60000)} min
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Poll Options */}
                    <div className="space-y-3">
                      {activePoll.options.map((option) => {
                        const hasVoted = votedPolls.has(activePoll.id);
                        const isSelected = selectedOptions.has(option.id);
                        
                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "relative rounded-lg border p-4 cursor-pointer transition-all",
                              !hasVoted && activePoll.status === 'active' && "hover:border-primary",
                              isSelected && "border-primary bg-primary/5"
                            )}
                            onClick={() => {
                              if (!hasVoted && activePoll.status === 'active') {
                                vote(activePoll.id, option.id);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {activePoll.type === 'single' && (
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border-2",
                                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                                  )} />
                                )}
                                {activePoll.type === 'multiple' && (
                                  <Checkbox checked={isSelected} />
                                )}
                                {activePoll.type === 'rating' && (
                                  <span className="text-lg">{option.text}</span>
                                )}
                                {activePoll.type !== 'rating' && (
                                  <p className="font-medium">{option.text}</p>
                                )}
                              </div>
                              {(activePoll.showResults === 'live' || hasVoted) && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {option.votes} ({option.percentage}%)
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {(activePoll.showResults === 'live' || hasVoted) && (
                              <div className="relative">
                                <Progress 
                                  value={option.percentage} 
                                  className="h-2"
                                />
                                <div
                                  className="absolute inset-0 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    background: option.color,
                                    width: `${option.percentage}%`,
                                    opacity: 0.8
                                  }}
                                />
                              </div>
                            )}
                            
                            {isSelected && (
                              <CheckCircle className="absolute top-4 right-4 h-5 w-5 text-primary" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {votedPolls.has(activePoll.id) && (
                      <Alert className="mt-4">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Thank you for voting! {activePoll.allowChangeVote && 'You can change your vote anytime.'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Results Visualization */}
                {(activePoll.showResults === 'live' || votedPolls.has(activePoll.id)) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Live Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="bar">
                        <TabsList className="grid grid-cols-2 w-[200px]">
                          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                          <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="bar">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={activePoll.options}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis 
                                dataKey="text" 
                                tick={{ fontSize: 12, fill: 'currentColor' }}
                              />
                              <YAxis 
                                tick={{ fontSize: 12, fill: 'currentColor' }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--background))', 
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                              <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                                {activePoll.options.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </TabsContent>
                        
                        <TabsContent value="pie">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={activePoll.options}
                                dataKey="votes"
                                nameKey="text"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={(entry) => `${entry.text}: ${entry.percentage}%`}
                              >
                                {activePoll.options.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--background))', 
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Vote className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a poll to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create Poll Dialog */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create New Poll</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsCreating(false);
                      setSelectedTemplate(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Templates */}
                <div>
                  <Label>Quick Templates</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {POLL_TEMPLATES.map((template) => {
                      const Icon = template.icon;
                      return (
                        <Button
                          key={template.id}
                          variant={selectedTemplate?.id === template.id ? 'default' : 'outline'}
                          className="h-auto flex-col items-start p-3"
                          onClick={() => applyTemplate(template)}
                        >
                          <Icon className="h-4 w-4 mb-1" />
                          <span className="text-xs">{template.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Question */}
                <div>
                  <Label>Question *</Label>
                  <Input
                    value={newPoll.question}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="What would you like to ask?"
                    className="mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newPoll.description}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add context or instructions..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                {/* Poll Type */}
                <div>
                  <Label>Poll Type</Label>
                  <Select
                    value={newPoll.type}
                    onValueChange={(value) => setNewPoll(prev => ({ ...prev, type: value as Poll['type'] }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Choice</SelectItem>
                      <SelectItem value="multiple">Multiple Choice</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="ranking">Ranking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Options *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      disabled={newPoll.options!.length >= 8}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newPoll.options!.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option.text}
                          onChange={(e) => {
                            const updated = [...newPoll.options!];
                            updated[index].text = e.target.value;
                            setNewPoll(prev => ({ ...prev, options: updated }));
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        {newPoll.options!.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="anonymous">Allow Anonymous Voting</Label>
                    <Switch
                      id="anonymous"
                      checked={newPoll.allowAnonymous}
                      onCheckedChange={(checked) => setNewPoll(prev => ({ ...prev, allowAnonymous: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="change">Allow Vote Changes</Label>
                    <Switch
                      id="change"
                      checked={newPoll.allowChangeVote}
                      onCheckedChange={(checked) => setNewPoll(prev => ({ ...prev, allowChangeVote: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auth">Require Authentication</Label>
                    <Switch
                      id="auth"
                      checked={newPoll.requireAuth}
                      onCheckedChange={(checked) => setNewPoll(prev => ({ ...prev, requireAuth: checked }))}
                    />
                  </div>
                </div>

                {/* Show Results */}
                <div>
                  <Label>Show Results</Label>
                  <Select
                    value={newPoll.showResults}
                    onValueChange={(value) => setNewPoll(prev => ({ ...prev, showResults: value as Poll['showResults'] }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live (Real-time)</SelectItem>
                      <SelectItem value="after">After Voting</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setSelectedTemplate(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={createPoll} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Create Poll
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}