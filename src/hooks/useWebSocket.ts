import { useEffect, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useAppStore';

export function useWebSocket() {
  const { user, getAccessToken } = useAuth();
  const { addNotification } = useAppStore();

  useEffect(() => {
    if (user) {
      // Get token and connect
      getAccessToken().then(token => {
        if (token) {
          wsService.connect(token);

        // Set up global event listeners
        const unsubscribers = [
          wsService.on('connected', () => {
            console.log('WebSocket connected');
            addNotification({
              type: 'success',
              message: 'Real-time connection established',
            });
          }),

          wsService.on('disconnected', (reason: string) => {
            console.log('WebSocket disconnected:', reason);
            if (reason !== 'io client disconnect') {
              addNotification({
                type: 'warning',
                message: 'Real-time connection lost. Reconnecting...',
              });
            }
          }),

          wsService.on('error', (error: any) => {
            console.error('WebSocket error:', error);
            addNotification({
              type: 'error',
              message: 'Connection error. Please refresh the page.',
            });
          }),

          wsService.on('system:notification', (data: any) => {
            addNotification({
              type: data.type || 'info',
              message: data.message,
            });
          }),
        ];

          // Cleanup on unmount or user change
          return () => {
            unsubscribers.forEach(unsub => unsub());
            wsService.disconnect();
          };
        }
      });
    }
  }, [user, getAccessToken, addNotification]);

  const sendMessage = useCallback((event: string, data: any) => {
    wsService.send(event, data);
  }, []);

  const subscribe = useCallback((event: string, callback: Function) => {
    return wsService.on(event, callback);
  }, []);

  const unsubscribe = useCallback((event: string, callback: Function) => {
    wsService.off(event, callback);
  }, []);

  const joinRoom = useCallback((room: string) => {
    wsService.joinRoom(room);
  }, []);

  const leaveRoom = useCallback((room: string) => {
    wsService.leaveRoom(room);
  }, []);

  const isConnected = useCallback(() => {
    return wsService.isConnected();
  }, []);

  return {
    sendMessage,
    subscribe,
    unsubscribe,
    joinRoom,
    leaveRoom,
    isConnected,
  };
}

// Hook for stream-specific WebSocket functionality
export function useStreamWebSocket(streamId?: string) {
  const { subscribe } = useWebSocket();
  const { addNotification } = useAppStore();

  useEffect(() => {
    if (!streamId) return;

    // Join stream room
    wsService.joinStream(streamId);

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
    if (streamId) {
      wsService.sendChatMessage(streamId, message);
    }
  }, [streamId]);

  return {
    sendChatMessage,
  };
}