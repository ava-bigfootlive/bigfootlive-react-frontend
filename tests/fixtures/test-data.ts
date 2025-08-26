/**
 * Test Data Fixtures for BigFootLive Platform
 */

export const testUsers = {
  admin: {
    email: 'admin@bigfootlive.io',
    password: 'Admin123!@#',
    role: 'admin'
  },
  streamer: {
    email: 'streamer@bigfootlive.io',
    password: 'Streamer123!',
    role: 'streamer'
  },
  viewer: {
    email: 'viewer@bigfootlive.io',
    password: 'Viewer123!',
    role: 'viewer'
  }
};

export const testEvents = {
  liveEvent: {
    title: 'Test Live Stream Event',
    description: 'Automated test event for regression testing',
    category: 'Technology',
    tags: ['test', 'automation', 'playwright'],
    scheduledStart: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    estimatedDuration: 60, // minutes
    maxViewers: 1000,
    chatEnabled: true,
    recordingEnabled: true
  },
  pastEvent: {
    title: 'Completed Test Event',
    description: 'A past event for testing historical data',
    category: 'Education',
    viewCount: 523,
    duration: 45,
    recordingUrl: 'https://bigfootlive.io/recordings/test-recording.m3u8'
  }
};

export const streamSettings = {
  rtmps: {
    url: 'rtmps://rtmps.bigfootlive.io:443/live',
    streamKey: 'test-stream-key-12345',
    resolution: '1920x1080',
    bitrate: 4500,
    fps: 30,
    codec: 'h264'
  },
  hls: {
    playbackUrl: 'https://bigfootlive.io/live/stream.m3u8',
    adaptiveBitrate: true,
    qualities: ['1080p', '720p', '480p', '360p'],
    latency: 'low'
  }
};

export const apiEndpoints = {
  health: '/health',
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh'
  },
  streaming: {
    start: '/api/streaming/start',
    stop: '/api/streaming/stop',
    status: '/api/streaming/status',
    analytics: '/api/streaming/analytics'
  },
  events: {
    list: '/api/events',
    create: '/api/events',
    details: '/api/events/:id',
    update: '/api/events/:id',
    delete: '/api/events/:id'
  }
};

export const testMessages = {
  chat: [
    'Hello everyone! 👋',
    'Great stream!',
    'Can you hear me?',
    'Audio is perfect',
    'Video quality is excellent'
  ],
  moderationTriggers: [
    'spam spam spam',
    'inappropriate content',
    'banned word test'
  ]
};

export const expectedResponses = {
  healthCheck: {
    status: 'healthy',
    message: 'Backend service is running'
  },
  streamingStatus: {
    isLive: false,
    viewers: 0,
    duration: 0,
    health: 'good'
  }
};