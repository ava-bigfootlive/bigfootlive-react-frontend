import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Ticket, 
  Users, 
  Calendar as CalendarIcon,
  Clock,
  Settings,
  TrendingUp,
  Gift,
  Shield,
  Globe,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Copy,
  QrCode,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';

interface PPVEvent {
  id: string;
  name: string;
  price: number;
  currency: string;
  date: Date;
  duration: number;
  status: 'draft' | 'published' | 'live' | 'completed';
  ticketsSold: number;
  revenue: number;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: Date;
  groupDiscounts?: {
    minTickets: number;
    discount: number;
  }[];
  promoCodes?: {
    code: string;
    discount: number;
    maxUses: number;
    used: number;
    expires?: Date;
  }[];
  restrictions?: {
    geoBlocking?: string[];
    maxTickets?: number;
    requiresVerification?: boolean;
  };
}

export const PayPerView: React.FC = () => {
  const [events, setEvents] = useState<PPVEvent[]>([
    {
      id: '1',
      name: 'Championship Finals 2024',
      price: 29.99,
      currency: 'USD',
      date: new Date('2024-03-15'),
      duration: 180,
      status: 'published',
      ticketsSold: 1250,
      revenue: 37487.50,
      earlyBirdPrice: 19.99,
      earlyBirdDeadline: new Date('2024-03-01'),
      groupDiscounts: [
        { minTickets: 5, discount: 10 },
        { minTickets: 10, discount: 15 }
      ],
      promoCodes: [
        { code: 'VIP20', discount: 20, maxUses: 100, used: 45 }
      ]
    },
    {
      id: '2',
      name: 'Concert Series: Summer Vibes',
      price: 14.99,
      currency: 'USD',
      date: new Date('2024-02-28'),
      duration: 120,
      status: 'live',
      ticketsSold: 3420,
      revenue: 51265.80
    }
  ]);

  const [newEvent, setNewEvent] = useState<Partial<PPVEvent>>({
    name: '',
    price: 0,
    currency: 'USD',
    duration: 120,
    status: 'draft'
  });

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [showGroupDiscountDialog, setShowGroupDiscountDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PPVEvent | null>(null);
  const [promoCode, setPromoCode] = useState({
    code: '',
    discount: 10,
    maxUses: 100
  });

  const generateTicketLink = async (event: PPVEvent) => {
    const ticketUrl = `https://bigfootlive.io/tickets/${event.id}`;
    const qrDataUrl = await QRCode.toDataURL(ticketUrl);
    
    // Create download link for QR code
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${event.name.replace(/\s+/g, '-')}-qr.png`;
    link.click();
    
    toast({
      title: "QR Code Generated",
      description: "QR code has been downloaded"
    });
  };

  const copyTicketLink = (eventId: string) => {
    const url = `https://bigfootlive.io/tickets/${eventId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Ticket purchase link copied to clipboard"
    });
  };

  const createPromoCode = () => {
    if (!selectedEvent || !promoCode.code) return;
    
    const updatedEvent = {
      ...selectedEvent,
      promoCodes: [
        ...(selectedEvent.promoCodes || []),
        { ...promoCode, used: 0 }
      ]
    };
    
    setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
    setShowPromoDialog(false);
    setPromoCode({ code: '', discount: 10, maxUses: 100 });
    
    toast({
      title: "Promo Code Created",
      description: `Code ${promoCode.code} has been created`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pay-Per-View Events</h1>
          <p className="text-muted-foreground">Manage ticketed events and revenue</p>
        </div>
        <Button>
          <Ticket className="h-4 w-4 mr-2" />
          Create PPV Event
        </Button>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$88,753.30</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,670</div>
            <p className="text-xs text-muted-foreground">+15% from last event</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 upcoming, 1 live</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">+0.5% improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Management */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {events.filter(e => e.status === 'published' || e.status === 'live').map(event => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {event.name}
                      <Badge variant={event.status === 'live' ? 'destructive' : 'default'}>
                        {event.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {format(event.date, 'PPP')} • {event.duration} minutes
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${event.price}</p>
                    <p className="text-sm text-muted-foreground">per ticket</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{event.ticketsSold}</strong> tickets sold
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>${event.revenue.toLocaleString()}</strong> revenue
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{event.promoCodes?.length || 0}</strong> promo codes
                    </span>
                  </div>
                </div>

                {event.earlyBirdPrice && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Early bird pricing: ${event.earlyBirdPrice} until {' '}
                      {event.earlyBirdDeadline && format(event.earlyBirdDeadline, 'PP')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => copyTicketLink(event.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => generateTicketLink(event)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowPromoDialog(true);
                    }}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Add Promo
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>

                {event.promoCodes && event.promoCodes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Active Promo Codes:</p>
                    <div className="flex gap-2 flex-wrap">
                      {event.promoCodes.map((promo, idx) => (
                        <Badge key={idx} variant="secondary">
                          {promo.code} ({promo.discount}% off) - {promo.used}/{promo.maxUses} used
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New PPV Event</CardTitle>
              <CardDescription>Set up a new pay-per-view ticketed event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="event-name">Event Name</Label>
                    <Input
                      id="event-name"
                      placeholder="Championship Finals 2024"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pricing</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-price">Ticket Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ticket-price"
                        type="number"
                        className="pl-9"
                        placeholder="29.99"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({...newEvent, price: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={newEvent.currency} onValueChange={(v) => setNewEvent({...newEvent, currency: v})}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="120"
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent({...newEvent, duration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="early-bird" />
                    <Label htmlFor="early-bird">Enable early bird pricing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="group-discount" />
                    <Label htmlFor="group-discount">Enable group discounts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="promo-codes" />
                    <Label htmlFor="promo-codes">Allow promo codes</Label>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Options</h3>
                <div className="space-y-2">
                  <Label>Accepted Payment Methods</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <Switch id="credit-card" defaultChecked />
                      <Label htmlFor="credit-card">Credit/Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="paypal" defaultChecked />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="crypto" />
                      <Label htmlFor="crypto">Cryptocurrency</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Restrictions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Restrictions</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-tickets">Maximum Tickets (optional)</Label>
                    <Input
                      id="max-tickets"
                      type="number"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="geo-blocking">Geo-blocking (optional)</Label>
                    <Input
                      id="geo-blocking"
                      placeholder="e.g., US, CA, UK"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="verification" />
                  <Label htmlFor="verification">Require identity verification</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Save as Draft</Button>
                <Button>Publish Event</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Promo Code Dialog */}
      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
            <DialogDescription>
              Add a promotional discount code for {selectedEvent?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo-code">Promo Code</Label>
              <Input
                id="promo-code"
                placeholder="e.g., SAVE20"
                value={promoCode.code}
                onChange={(e) => setPromoCode({...promoCode, code: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Slider
                id="discount"
                min={5}
                max={50}
                step={5}
                value={[promoCode.discount]}
                onValueChange={(v) => setPromoCode({...promoCode, discount: v[0]})}
              />
              <p className="text-sm text-muted-foreground text-center">{promoCode.discount}% off</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-uses">Maximum Uses</Label>
              <Input
                id="max-uses"
                type="number"
                value={promoCode.maxUses}
                onChange={(e) => setPromoCode({...promoCode, maxUses: parseInt(e.target.value)})}
              />
            </div>
            <Button onClick={createPromoCode} className="w-full">
              Create Promo Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayPerView;