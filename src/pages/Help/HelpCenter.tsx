import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { 
  Search, 
  FileText, 
  Video, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Star,
  ChevronRight,
  Download,
  ExternalLink,
  BookOpen,
  PlayCircle,
  Users,
  Headphones,
  Globe,
  Shield,
  CreditCard,
  Settings,
  Zap,
  HelpCircle
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  tags: string[];
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  responses: number;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  type: 'article' | 'video' | 'tutorial';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  views: number;
  rating: number;
  lastUpdated: Date;
}

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);

  useEffect(() => {
    // Simulate loading support tickets
    setTickets([
      {
        id: 'TICK-001',
        title: 'Streaming quality issues',
        description: 'My stream keeps buffering during peak hours',
        status: 'in-progress',
        priority: 'high',
        category: 'streaming',
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-15T14:20:00'),
        assignedTo: 'Sarah Chen',
        responses: 3
      },
      {
        id: 'TICK-002',
        title: 'Payment processing failed',
        description: 'Unable to process subscription payment',
        status: 'resolved',
        priority: 'medium',
        category: 'billing',
        createdAt: new Date('2024-01-14T09:15:00'),
        updatedAt: new Date('2024-01-14T16:45:00'),
        assignedTo: 'Mike Johnson',
        responses: 5
      },
      {
        id: 'TICK-003',
        title: 'User permissions not working',
        description: 'Moderators cannot access content management',
        status: 'open',
        priority: 'medium',
        category: 'accounts',
        createdAt: new Date('2024-01-13T11:20:00'),
        updatedAt: new Date('2024-01-13T11:20:00'),
        responses: 0
      }
    ]);

    // Simulate loading FAQs
    setFaqs([
      {
        id: 'faq-001',
        question: 'How do I set up live streaming?',
        answer: 'To set up live streaming, navigate to the Stream Manager, configure your RTMP settings, set up your streaming software (OBS, XSplit), and click "Go Live". Make sure your internet connection is stable.',
        category: 'streaming',
        helpful: 42,
        notHelpful: 3,
        tags: ['streaming', 'setup', 'rtmp', 'obs']
      },
      {
        id: 'faq-002',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. Enterprise customers can also set up invoicing.',
        category: 'billing',
        helpful: 28,
        notHelpful: 1,
        tags: ['payment', 'billing', 'subscription']
      },
      {
        id: 'faq-003',
        question: 'How do I add team members?',
        answer: 'Go to User Management, click "Invite User", enter their email address, select their role (Admin, Moderator, Member), and send the invitation. They will receive an email to join your team.',
        category: 'accounts',
        helpful: 35,
        notHelpful: 2,
        tags: ['team', 'users', 'permissions']
      },
      {
        id: 'faq-004',
        question: 'What are the streaming quality requirements?',
        answer: 'For optimal quality: 1080p at 30fps requires 4-6 Mbps upload, 720p at 30fps requires 2-4 Mbps upload. We recommend a stable internet connection with at least 50% more bandwidth than your target bitrate.',
        category: 'streaming',
        helpful: 67,
        notHelpful: 5,
        tags: ['quality', 'bitrate', 'requirements']
      }
    ]);

    // Simulate loading guides
    setGuides([
      {
        id: 'guide-001',
        title: 'Getting Started with BigFootLive',
        description: 'Complete beginner guide to setting up your streaming platform',
        category: 'getting-started',
        duration: '15 min read',
        type: 'article',
        difficulty: 'beginner',
        views: 1250,
        rating: 4.8,
        lastUpdated: new Date('2024-01-10')
      },
      {
        id: 'guide-002',
        title: 'Advanced Streaming Setup',
        description: 'Configure multiple bitrates, custom overlays, and advanced features',
        category: 'streaming',
        duration: '25 min video',
        type: 'video',
        difficulty: 'advanced',
        views: 890,
        rating: 4.6,
        lastUpdated: new Date('2024-01-08')
      },
      {
        id: 'guide-003',
        title: 'Monetization Strategies',
        description: 'Learn how to monetize your content with subscriptions and pay-per-view',
        category: 'monetization',
        duration: '20 min tutorial',
        type: 'tutorial',
        difficulty: 'intermediate',
        views: 2100,
        rating: 4.9,
        lastUpdated: new Date('2024-01-12')
      }
    ]);
  }, []);

  const categories = [
    { id: 'all', name: 'All Categories', icon: Globe },
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen },
    { id: 'streaming', name: 'Streaming', icon: PlayCircle },
    { id: 'accounts', name: 'Accounts & Users', icon: Users },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Settings },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: Zap }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateTicket = () => {
    toast({
      title: "Support Ticket Created",
      description: "Your ticket has been submitted. We'll respond within 24 hours.",
    });
    setIsCreateTicketOpen(false);
  };

  const handleFAQFeedback = (faqId: string, helpful: boolean) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === faqId 
        ? { ...faq, helpful: helpful ? faq.helpful + 1 : faq.helpful, notHelpful: helpful ? faq.notHelpful : faq.notHelpful + 1 }
        : faq
    ));
    toast({
      title: "Feedback Recorded",
      description: "Thank you for your feedback!",
    });
  };

  const filteredFAQs = faqs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (searchTerm === '' || 
     faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
     faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const filteredGuides = guides.filter(guide => 
    (selectedCategory === 'all' || guide.category === selectedCategory) &&
    (searchTerm === '' || 
     guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     guide.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-gray-600 mt-1">Get the support you need</p>
        </div>
        <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Headphones className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll help you resolve it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticket-title">Subject</Label>
                <Input id="ticket-title" placeholder="Brief description of your issue" />
              </div>
              <div>
                <Label htmlFor="ticket-category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="streaming">Streaming</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="accounts">Accounts</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ticket-priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ticket-description">Description</Label>
                <Textarea 
                  id="ticket-description" 
                  placeholder="Please provide detailed information about your issue"
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateTicketOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket}>
                  Create Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search FAQs, guides, and documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <category.icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-gray-600">New to the platform? Start here</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <PlayCircle className="w-8 h-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Streaming Setup</h3>
            <p className="text-sm text-gray-600">Configure your live streams</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">Billing Help</h3>
            <p className="text-sm text-gray-600">Payment and subscription issues</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Headphones className="w-8 h-8 mx-auto mb-3 text-orange-600" />
            <h3 className="font-semibold mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600">Get personalized help</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="space-y-4">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                      <p className="text-gray-600 mb-3">{faq.answer}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {faq.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        {faq.helpful} helpful
                      </span>
                      <span className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                        {faq.notHelpful} not helpful
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFAQFeedback(faq.id, true)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Helpful
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFAQFeedback(faq.id, false)}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Not Helpful
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <Card key={guide.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {guide.type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                          {guide.type === 'article' && <FileText className="w-4 h-4 text-green-600" />}
                          {guide.type === 'tutorial' && <PlayCircle className="w-4 h-4 text-purple-600" />}
                          <Badge variant="outline" className="text-xs">
                            {guide.difficulty}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{guide.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>{guide.duration}</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                              {guide.rating}
                            </div>
                            <span>{guide.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Updated {guide.lastUpdated.toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Guide
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{ticket.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>#{ticket.id}</span>
                      <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                      <span>Updated: {ticket.updatedAt.toLocaleDateString()}</span>
                      {ticket.assignedTo && <span>Assigned to: {ticket.assignedTo}</span>}
                      <span>{ticket.responses} responses</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Support
                </CardTitle>
                <CardDescription>
                  Get detailed help via email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>General Support:</strong> support@bigfootlive.com</p>
                  <p><strong>Billing:</strong> billing@bigfootlive.com</p>
                  <p><strong>Technical:</strong> tech@bigfootlive.com</p>
                  <p><strong>Sales:</strong> sales@bigfootlive.com</p>
                  <div className="flex items-center mt-4 text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    Response time: 24 hours
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Live Chat
                </CardTitle>
                <CardDescription>
                  Chat with our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Available now</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Monday - Friday: 9 AM - 6 PM EST<br />
                    Saturday: 10 AM - 2 PM EST
                  </p>
                  <Button className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Phone Support
                </CardTitle>
                <CardDescription>
                  Speak directly with our team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>US:</strong> +1 (555) 123-4567</p>
                  <p><strong>UK:</strong> +44 20 1234 5678</p>
                  <p><strong>EU:</strong> +49 30 12345678</p>
                  <div className="flex items-center mt-4 text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    Monday - Friday: 9 AM - 6 PM EST
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Resources
                </CardTitle>
                <CardDescription>
                  Documentation and downloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    API Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    OBS Setup Guide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Video Tutorials
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Community Forum
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpCenter;