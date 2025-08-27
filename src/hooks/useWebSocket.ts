import { useEffect, useCallback, useState } from 'react';
import wsService from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useAppStore';

interface UseWebSocketOptions {
  autoConnect?: boolean; // Whether to auto-connect on mount
  silent?: boolean; // Suppress error notifications
  maxRetries?: number;
  retryDelay?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = false, silent = true, maxRetries = 3, retryDelay = 2000 } = options;
  const { user, getAccessToken } = useAuth();
  const { addNotification } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'failed'>('disconnected');

  // Manual connect function
  const connect = useCallback(async (eventId?: string) => {
    if (!user) {
      console.log('Cannot connect WebSocket: no user authenticated');
      return;
    }
    
    try {
      setConnectionState('connecting');
      const token = await getAccessToken();
      if (!token) {
        console.log('Cannot connect WebSocket: no auth token');
        setConnectionState('failed');
        return;
      }
      
      // Connect with options
      await wsService.connect(eventId || token, eventId ? token : undefined, {
        silent,
        maxRetries,
        retryDelay
      });
      
      setConnectionState('connected');
      setIsConnected(true);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnectionState('failed');
      setIsConnected(false);
      
      // Only show notification if not in silent mode
      if (!silent) {
        addNotification({
          type: 'warning',
          message: 'Real-time features unavailable',
        });
      }
    }
  }, [user, getAccessToken, silent, maxRetries, retryDelay, addNotification]);

  useEffect(() => {
    // Only auto-connect if explicitly requested and user is authenticated
    if (autoConnect && user) {
      connect();

    }
    
    // Set up global event listeners (always set up, regardless of connection)
    const unsubscribers = [
      wsService.onWithUnsubscribe('connected', () => {
        console.log('WebSocket connected');
        setConnectionState('connected');
        setIsConnected(true);
        
        // Only show notification if not in silent mode
        if (!silent) {
          addNotification({
            type: 'success',
            message: 'Real-time connection established',
          });
        }
      }),

      wsService.onWithUnsubscribe('disconnected', (reason: string) => {
        console.log('WebSocket disconnected:', reason);
        setConnectionState('disconnected');
        setIsConnected(false);
        
        // Only show notification for non-manual disconnects and not in silent mode
        if (reason !== 'io client disconnect' && reason !== 'Manual disconnect' && !silent) {
          addNotification({
            type: 'warning',
            message: 'Real-time connection lost',
          });
        }
      }),

      wsService.onWithUnsubscribe('error', (error: any) => {
        console.error('WebSocket error:', error);
        setConnectionState('failed');
        setIsConnected(false);
        
        // Only show error in non-silent mode
        if (!silent) {
          addNotification({
            type: 'warning',
            message: 'Connection issue. Real-time features may be limited.',
          });
        }
      }),

      wsService.onWithUnsubscribe('system:notification', (data: any) => {
        addNotification({
          type: data.type || 'info',
          message: data.message,
        });
      }),
    ];

    // Cleanup on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
      if (isConnected) {
        wsService.disconnect();
      }
    };
  }, [autoConnect, user, silent, addNotification, connect, isConnected]);

  const sendMessage = useCallback((event: string, data: any) => {
    wsService.send(event, data);
  }, []);

  const subscribe = useCallback((event: string, callback: Function) => {
    return wsService.onWithUnsubscribe(event, callback as (...args: any[]) => void);
  }, []);

  const unsubscribe = useCallback((event: string, callback: Function) => {
    wsService.off(event, callback as (...args: any[]) => void);
  }, []);

  const joinRoom = useCallback((room: string) => {
    wsService.joinRoom(room);
  }, []);

  const leaveRoom = useCallback((room: string) => {
    wsService.leaveRoom(room);
  }, []);

  const isConnectedCheck = useCallback(() => {
    return wsService.isConnected();
  }, []);

  return {
    connect, // Manual connection function
    disconnect: wsService.disconnect.bind(wsService),
    sendMessage,
    subscribe,
    unsubscribe,
    joinRoom,
    leaveRoom,
    isConnected: isConnectedCheck,
    connectionState,
    messages: wsService.messages,
  };
}

// Hook for stream-specific WebSocket functionality
export function useStreamWebSocket(streamId?: string, options: UseWebSocketOptions = {}) {
  // Use manual connection for stream-specific WebSocket
  const { connect, subscribe, isConnected, connectionState } = useWebSocket({ 
    ...options,
    autoConnect: false, // Never auto-connect for streams
    silent: options.silent !== undefined ? options.silent : true // Default to silent
  });
  const { addNotification } = useAppStore();

  useEffect(() => {
    if (!streamId) return;

    // Only connect and join if we have a stream ID
    const initConnection = async () => {
      // Connect if not already connected
      if (!isConnected()) {
        await connect(streamId);
      }
      
      // Join stream room
      if (isConnected()) {
        wsService.joinStream(streamId);
      }
    };
    
    initConnection();

    // Set up stream-specific event listeners
    const unsubscribers = [
      subscribe('stream:started', (data: any) => {
        if (data.streamId === streamId) {
          addNotification({
            type: 'success',
            message: 'Stream started successfully',
          });
        }
      }),

      subscribe('stream:ended', (data: any) => {
        if (data.streamId === streamId) {
          addNotification({
            type: 'info',
            message: 'Stream has ended',
          });
        }
      }),

      subscribe('stream:error', (data: any) => {
        if (data.streamId === streamId) {
          addNotification({
            type: 'error',
            message: data.message || 'Stream error occurred',
          });
        }
      }),
    ];

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
      wsService.leaveStream(streamId);
    };
  }, [streamId, subscribe, addNotification]);

  const sendChatMessage = useCallback((message: string) => {
    if (streamId && isConnected()) {
      wsService.sendChatMessage(message);
    }
  }, [streamId, isConnected]);

  return {
    sendChatMessage,
    isConnected,
    connectionState,
  };
}