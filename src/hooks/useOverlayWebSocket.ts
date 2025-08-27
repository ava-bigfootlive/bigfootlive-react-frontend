import { useState, useEffect, useCallback, useRef } from 'react';

interface OverlayQueueItem {
  id: string;
  content_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  queue_position: number;
  queued_at: string;
  started_at?: string;
  completed_at?: string;
}

interface OverlayWebSocketMessage {
  type: string;
  event_id: string;
  data?: any;
  timestamp?: string;
}

interface UseOverlayWebSocketOptions {
  eventId: string;
  onQueueUpdate?: (queueItems: OverlayQueueItem[]) => void;
  onStatusChange?: (overlayId: string, status: string) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
}

export const useOverlayWebSocket = ({
  eventId,
  onQueueUpdate,
  onStatusChange,
  onError,
  onConnect,
  onDisconnect,
  reconnectInterval = 3000
}: UseOverlayWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<OverlayWebSocketMessage | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/v1/overlays/events/${eventId}/ws`;
  }, [eventId]);

  // Send message
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Trigger overlay via WebSocket
  const triggerOverlay = useCallback((queueItemId: string, options?: { display_duration?: number }) => {
    return sendMessage({
      type: 'trigger_overlay',
      queue_item_id: queueItemId,
      ...options
    });
  }, [sendMessage]);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: OverlayWebSocketMessage = JSON.parse(event.data);
      setLastMessage(message);

      switch (message.type) {
        case 'pong':
          // Keep-alive response
          break;
          
        case 'overlay_queue_update':
          if (message.data && onQueueUpdate) {
            onQueueUpdate(message.data);
          }
          break;
          
        case 'overlay_status_change':
          if (message.data && onStatusChange) {
            onStatusChange(message.data.overlay_id, message.data.status);
          }
          break;
          
        case 'overlay_triggered':
          // Overlay has been triggered
          console.log('Overlay triggered:', message.data);
          break;
          
        case 'overlay_completed':
          // Overlay has completed
          console.log('Overlay completed:', message.data);
          break;
          
        case 'error':
          if (onError) {
            onError(message.data?.message || 'WebSocket error');
          }
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      onError?.('Error parsing message from server');
    }
  }, [onQueueUpdate, onStatusChange, onError]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        onConnect?.();

        // Start ping/pong for keep-alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        onError?.('WebSocket connection error');
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onDisconnect?.();

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = undefined;
        }

        // Attempt to reconnect if not a clean close
        if (!event.wasClean && reconnectAttempts < 5) {
          setReconnectAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('error');
      onError?.('Failed to create WebSocket connection');
    }
  }, [getWebSocketUrl, handleMessage, onConnect, onDisconnect, onError, reconnectAttempts, reconnectInterval]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = undefined;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    setReconnectAttempts(0);
  }, []);

  // Force reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  // Effect to establish connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [eventId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    reconnectAttempts,
    sendMessage,
    triggerOverlay,
    connect,
    disconnect,
    reconnect
  };
};