# BigFootLive React Frontend

Clean, modern React SPA for the BigFootLive streaming platform.

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (10x faster than webpack)
- **Styling**: Tailwind CSS
- **Auth**: AWS Amplify + Cognito
- **State**: Zustand
- **Routing**: React Router v6
- **API**: REST with JWT authentication
- **WebSocket**: Socket.io for real-time features

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env` file:

```env
VITE_COGNITO_USER_POOL_ID=us-west-1_6IUovRAM1
VITE_COGNITO_CLIENT_ID=1vk1puqortjm4kk08kh0u1otaj
VITE_COGNITO_REGION=us-west-1
VITE_API_URL=https://api.bigfootlive.io
VITE_WS_URL=wss://api.bigfootlive.io
```

## Project Structure

```
src/
├── pages/          # All application pages
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── services/       # API and WebSocket clients
├── store/          # Zustand global state
├── hooks/          # Custom React hooks
├── lib/            # Configuration files
└── types/          # TypeScript definitions
```

## Features

✅ **Authentication**
- AWS Cognito integration
- Sign up with email verification
- Password reset flow
- JWT token management
- Protected routes

✅ **Multi-Tenant Support**
- Organization selection
- Tenant-based routing
- Role-based access control

✅ **Streaming**
- RTMP stream configuration
- HLS playback with HLS.js
- Real-time chat
- Viewer analytics
- Stream recording

✅ **Admin Features**
- Platform admin dashboard
- User management
- Event management
- Analytics dashboard

## Deployment

### Manual Deployment

```bash
# Build and deploy to S3/CloudFront
./deploy.sh
```

### Automatic Deployment

Push to `main` branch triggers GitHub Actions deployment.

## Architecture Decisions

### Why Vite over Next.js?
- **Speed**: 10x faster builds and HMR
- **Simplicity**: No SSR complexity for a SPA
- **Cost**: Static hosting ($5/month vs $50/month)
- **Clear paradigm**: Client-side only, no confusion

### Why Client-Side Auth?
- Cognito is designed for client-side use
- No backend proxy needed
- Automatic token refresh
- Lower latency

## API Integration

All API calls automatically include JWT tokens:

```typescript
// Example API call
const events = await apiClient.getEvents();
```

## WebSocket Events

Real-time features use Socket.io:

```typescript
// Example WebSocket usage
const { socket, isConnected } = useWebSocket();

socket.emit('join-event', eventId);
socket.on('chat-message', handleMessage);
```

## Testing

```bash
# Run tests (when configured)
npm test
```

## Performance

- **Build time**: ~5 seconds
- **Bundle size**: <500KB gzipped
- **Lighthouse score**: 95+
- **Time to interactive**: <2 seconds

## Support

For issues or questions, contact the development team.