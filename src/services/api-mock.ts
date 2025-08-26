// Temporary mock responses for missing endpoints
// These should be replaced with real API calls once backend is updated

export const mockDashboardStats = {
  totalViewers: 1234,
  activeStreams: 3,
  revenue: {
    today: 543.21,
    month: 12453.89
  },
  bandwidth: {
    used: 234.5,
    total: 1000
  },
  topStreams: [
    { id: 1, title: 'Gaming Marathon', viewers: 523 },
    { id: 2, title: 'Music Concert', viewers: 412 },
    { id: 3, title: 'Tech Talk', viewers: 299 }
  ]
};

export const mockCurrentStream = {
  id: 'stream-123',
  title: 'Live Stream',
  status: 'active',
  startedAt: new Date().toISOString(),
  viewers: 42,
  bitrate: '5000 kbps',
  quality: '1080p',
  health: 'excellent'
};

export const mockStreamingEvents = [
  {
    id: 'event-1',
    title: 'Upcoming Gaming Tournament',
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    status: 'scheduled',
    category: 'gaming'
  },
  {
    id: 'event-2',
    title: 'Music Festival Live',
    scheduledFor: new Date(Date.now() + 172800000).toISOString(),
    status: 'scheduled',
    category: 'music'
  },
  {
    id: 'event-3',
    title: 'Tech Conference Keynote',
    scheduledFor: new Date(Date.now() + 259200000).toISOString(),
    status: 'scheduled',
    category: 'technology'
  }
];