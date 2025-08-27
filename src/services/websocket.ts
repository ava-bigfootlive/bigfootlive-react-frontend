import { EventEmitter } from 'events';
import { errorHandler, AppError, ErrorType, ErrorSeverity } from '@/utils/errorHandler';
import { toast } from '@/components/ui/use-toast';

export interface StreamMetrics {
  bitrate: number;
  viewers: number;
  frameRate: number;
  cpuUsage: number;
  memoryUsage: number;
  bandwidth: {
    inbound: number;
    outbound: number;
  };
  health: 'good' | 'warning' | 'critical';
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  user: string;
  message: string;
  timestamp: Date;
}

export interface ConnectOptions {
  silent?: boolean; // Don't show error notifications
  maxRetries?: number; // Override max reconnect attempts
  retryDelay?: number; // Override retry delay
}

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventId: string | null = null;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  public messages: ChatMessage[] = [];
  private token: string | null = null;
  private currentRoom: string | null = null;
  private silentMode = false;
  private lastErrorTime = 0;
  private errorThrottleMs = 5000; // Throttle errors to once per 5 seconds
  private isManuallyDisconnected = false;

  constructor() {
    super();
  }

  // Support both signatures for backward compatibility with options
  connect(tokenOrEventId?: string, tokenOrOptions?: string | ConnectOptions, options?: ConnectOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // Handle different call signatures
      let actualToken: string | undefined;
      let actualEventId: string | undefined;
      let connectOptions: ConnectOptions = {};
      
      if (typeof tokenOrOptions === 'string') {
        // Called with (eventId, token, options?)
        actualEventId = tokenOrEventId;
        actualToken = tokenOrOptions;
        connectOptions = options || {};
      } else if (typeof tokenOrOptions === 'object') {
        // Called with (tokenOrEventId, options)
        if (tokenOrEventId && tokenOrEventId.includes('-')) {
          actualEventId = tokenOrEventId;
        } else {
          actualToken = tokenOrEventId;
        }
        connectOptions = tokenOrOptions || {};
      } else if (tokenOrEventId && tokenOrEventId.includes('-')) {
        // Looks like an event ID
        actualEventId = tokenOrEventId;
      } else {
        // Looks like a token
        actualToken = tokenOrEventId;
      }

      // Set connection options
      this.silentMode = connectOptions.silent || false;
      this.maxReconnectAttempts = connectOptions.maxRetries || 5;
      this.reconnectDelay = connectOptions.retryDelay || 1000;
      this.isManuallyDisconnected = false;

      // Silent fail for WebSocket connection
      // This allows the app to work without a backend

      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        console.log('WebSocket already connected or connecting');
        resolve();
        return;
      }

      this.token = actualToken || null;
      this.eventId = actualEventId || 'default';
      this.isConnecting = true;

      const wsUrl = import.meta.env.VITE_WS_URL || 'wss://api.bigfootlive.io';
      const endpoint = actualEventId ? `/api/v1/ws/streaming/${actualEventId}` : '/api/v1/ws';
      const url = `${wsUrl}${endpoint}${actualToken ? `?token=${actualToken}` : ''}`;

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connected');
          this.startHeartbeat();
          resolve();
          
          // Only show success message for reconnections in non-silent mode
          if (this.reconnectAttempts > 0 && !this.silentMode) {
            toast({
              title: 'Connection Restored',
              description: 'Real-time connection has been re-established',
              variant: 'default'
            });
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            const parseError = new AppError(
              'Failed to parse WebSocket message',
              ErrorType.WEBSOCKET,
              ErrorSeverity.WARNING,
              undefined,
              { message: event.data, error },
              false
            );
            errorHandler.handle(parseError, 'WebSocket Message Parse Error');
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          
          // Silent fail - don't show WebSocket errors
          console.log('WebSocket connection failed silently');
          this.emit('error', error);
          reject(new Error('Connection failed'));
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected');
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected', event.reason || 'Connection closed');
          
          // Don't show errors or reconnect if manually disconnected
          if (this.isManuallyDisconnected) {
            return;
          }
          
          // Determine close reason and severity
          let severity: ErrorSeverity = 'warning';
          let message = 'WebSocket connection closed';
          let shouldShowError = false;
          
          if (event.code === 1006) {
            message = 'WebSocket connection lost';
            severity = 'warning'; // Reduced from error
            shouldShowError = !this.silentMode;
          } else if (event.code === 1000) {
            message = 'WebSocket connection closed normally';
            severity = 'info';
          } else if (event.code === 1001) {
            message = 'WebSocket endpoint is going away';
            severity = 'info';
          } else if (event.code === 1002) {
            message = 'WebSocket protocol error';
            severity = 'warning';
            shouldShowError = !this.silentMode;
          } else if (event.code === 1003) {
            message = 'WebSocket received unsupported data';
            severity = 'warning';
            shouldShowError = !this.silentMode;
          }
          
          // Silent fail - don't show close errors
          console.log(`WebSocket closed: ${message}`);
          
          // Still attempt to reconnect
          this.handleReconnect();
        };
      } catch (error: any) {
        console.error('Failed to create WebSocket:', error);
        this.isConnecting = false;
        
        // Silent fail - don't show creation errors
        console.log('Failed to create WebSocket:', error.message);
        this.emit('error', error);
        
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    // Handle different message formats
    if (data.event) {
      // Socket.io style event
      this.emit(data.event, data.data);
    }
    
    switch (data.type) {
      case 'metrics':
        this.emit('metrics', data.data as StreamMetrics);
        break;
      case 'chat':
      case 'message':
        const chatMessage = data.data as ChatMessage;
        this.messages.push(chatMessage);
        this.emit('chat', chatMessage);
        this.emit('message', chatMessage);
        break;
      case 'viewer_count':
        this.emit('viewers', data.data.count);
        break;
      case 'stream_status':
        this.emit('status', data.data.status);
        break;
      case 'error':
        this.emit('error', data.data);
        break;
      case 'pong':
        // Heartbeat response
        break;
      default:
        // Emit as generic event
        if (data.type) {
          this.emit(data.type, data.data);
        }
        console.log('Unknown message type:', data.type);
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleReconnect() {
    // Don't reconnect if manually disconnected
    if (this.isManuallyDisconnected) {
      return;
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Silent fail - no error messages for max retries
      console.log('Maximum reconnection attempts reached');
      
      this.emit('max_reconnect_failed');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });
    
    // Silent reconnection - no toasts
    console.log('Attempting to reconnect...');

    setTimeout(() => {
      // Preserve silent mode on reconnect
      const options: ConnectOptions = { 
        silent: this.silentMode,
        maxRetries: this.maxReconnectAttempts,
        retryDelay: this.reconnectDelay
      };
      
      if (this.token && this.eventId) {
        this.connect(this.eventId, this.token, options);
      } else if (this.token) {
        this.connect(this.token, options);
      } else if (this.eventId) {
        this.connect(this.eventId, options);
      }
    }, delay);
  }

  // Support multiple send signatures
  send(eventOrData: string | any, data?: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        let message: any;
        
        if (typeof eventOrData === 'string' && data !== undefined) {
          // send(event, data) format
          message = { type: eventOrData, event: eventOrData, data };
        } else if (typeof eventOrData === 'object') {
          // send(data) format
          message = eventOrData;
        } else {
          // send(event) format with no data
          message = { type: eventOrData, event: eventOrData };
        }
        
        this.ws.send(JSON.stringify(message));
      } catch (error: any) {
        const sendError = new AppError(
          'Failed to send WebSocket message',
          ErrorType.WEBSOCKET,
          ErrorSeverity.ERROR,
          undefined,
          { data: eventOrData, error: error.message },
          false
        );
        errorHandler.handle(sendError, 'WebSocket Send Error');
      }
    } else {
      const notConnectedError = new AppError(
        'Cannot send message: WebSocket not connected',
        ErrorType.WEBSOCKET,
        ErrorSeverity.WARNING,
        undefined,
        { state: this.getConnectionState() },
        false
      );
      errorHandler.handle(notConnectedError, 'WebSocket Not Connected');
    }
  }

  sendMessage(event: string, data: any) {
    this.send(event, data);
  }

  sendChatMessage(message: string) {
    this.send('chat', { message });
  }

  // Event/Room management methods
  joinEvent(eventId: string) {
    this.send('join_event', { eventId });
    this.eventId = eventId;
  }

  leaveEvent(eventId: string) {
    this.send('leave_event', { eventId });
  }

  joinRoom(room: string) {
    this.send('join_room', { room });
    this.currentRoom = room;
  }

  leaveRoom(room: string) {
    this.send('leave_room', { room });
    if (this.currentRoom === room) {
      this.currentRoom = null;
    }
  }

  joinStream(streamId: string) {
    this.send('join_stream', { streamId });
  }

  leaveStream(streamId: string) {
    this.send('leave_stream', { streamId });
  }

  // Typing indicator
  sendTypingIndicator(eventId: string, isTyping: boolean) {
    this.send('typing', { eventId, isTyping });
  }

  // Subscribe/Unsubscribe with proper typing
  on(event: string | symbol, callback: (...args: any[]) => void): this {
    super.on(event, callback);
    return this;
  }

  off(event: string | symbol, callback: (...args: any[]) => void): this {
    super.off(event, callback);
    return this;
  }

  // Helper method that returns an unsubscribe function
  onWithUnsubscribe(event: string, callback: (...args: any[]) => void): () => void {
    this.on(event, callback);
    return () => this.off(event, callback);
  }

  subscribe(event: string, callback: (...args: any[]) => void): WebSocketService {
    this.on(event, callback);
    return this;
  }

  unsubscribe(event: string, callback: (...args: any[]) => void): void {
    this.off(event, callback);
  }

  disconnect() {
    this.isManuallyDisconnected = true; // Flag manual disconnection
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect'); // Normal closure
      this.ws = null;
    }
    this.eventId = null;
    this.currentRoom = null;
    this.messages = [];
    this.silentMode = false;
    this.isConnecting = false;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

// Export as singleton
export const webSocketService = new WebSocketService();
export default webSocketService;