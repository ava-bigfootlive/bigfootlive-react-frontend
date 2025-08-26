import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    
    this.socket = io(wsUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('disconnected', reason);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });

    // Set up event forwarding
    this.setupEventForwarding();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  private setupEventForwarding() {
    if (!this.socket) return;

    // Stream events
    this.socket.on('stream:started', (data) => this.emit('stream:started', data));
    this.socket.on('stream:ended', (data) => this.emit('stream:ended', data));
    this.socket.on('stream:error', (data) => this.emit('stream:error', data));
    
    // Chat events
    this.socket.on('chat:message', (data) => this.emit('chat:message', data));
    this.socket.on('chat:user_joined', (data) => this.emit('chat:user_joined', data));
    this.socket.on('chat:user_left', (data) => this.emit('chat:user_left', data));
    
    // Analytics events
    this.socket.on('analytics:viewers', (data) => this.emit('analytics:viewers', data));
    this.socket.on('analytics:engagement', (data) => this.emit('analytics:engagement', data));
    
    // System events
    this.socket.on('system:notification', (data) => this.emit('system:notification', data));
    this.socket.on('system:maintenance', (data) => this.emit('system:maintenance', data));
  }

  // Event emitter pattern
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Send events to server
  send(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot send event:', event);
    }
  }

  // Join/leave rooms
  joinRoom(room: string) {
    this.send('join:room', { room });
  }

  leaveRoom(room: string) {
    this.send('leave:room', { room });
  }

  // Stream specific methods
  joinStream(streamId: string) {
    this.joinRoom(`stream:${streamId}`);
  }

  leaveStream(streamId: string) {
    this.leaveRoom(`stream:${streamId}`);
  }

  sendChatMessage(streamId: string, message: string) {
    this.send('chat:send', { streamId, message });
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const wsService = new WebSocketService();