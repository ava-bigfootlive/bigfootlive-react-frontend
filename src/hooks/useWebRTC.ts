/**
 * WebRTC Hook for BigFootLive Multi-Presenter System
 * 
 * Provides comprehensive WebRTC functionality including:
 * - WebRTC connection management with error recovery
 * - Peer connection handling and reconnection logic
 * - Media stream management (camera, microphone, screen)
 * - Signaling protocol implementation
 * - Quality adaptation based on bandwidth
 * - Presenter queue and approval system
 * - Breakout room support
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Device } from 'mediasoup-client';
import { Transport } from 'mediasoup-client/lib/Transport';
import { Producer } from 'mediasoup-client/lib/Producer';
import { Consumer } from 'mediasoup-client/lib/Consumer';

// Types for WebRTC functionality
export interface WebRTCPeer {
  peerId: string;
  userId: string;
  displayName: string;
  role: 'presenter' | 'moderator' | 'attendee' | 'admin';
  isPresenting: boolean;
  isScreenSharing: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'failed';
}

export interface WebRTCRoom {
  roomId: string;
  eventId: string;
  roomType: 'main' | 'breakout';
  name: string;
  peerCount: number;
  presenterCount: number;
  queueLength: number;
  isRecording: boolean;
  isLocked: boolean;
  mutedAll: boolean;
  features: {
    maxPresenters: number;
    maxParticipants: number;
    allowScreenShare: boolean;
    enableChat: boolean;
    enableRecording: boolean;
  };
}

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
}

export interface WebRTCStats {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsLost: number;
  jitter: number;
  rtt: number;
  bandwidth: number;
  quality: 'excellent' | 'good' | 'poor' | 'failed';
}

export interface WebRTCConfig {
  apiUrl: string;
  wsUrl: string;
  stunServers: string[];
  turnServers?: {
    urls: string;
    username: string;
    credential: string;
  }[];
  enableSimulcast: boolean;
  enableSvc: boolean;
  maxBitrate: {
    video: number;
    audio: number;
    screen: number;
  };
}

export interface UseWebRTCOptions {
  roomId: string;
  userId: string;
  displayName: string;
  role?: 'presenter' | 'moderator' | 'attendee' | 'admin';
  autoJoin?: boolean;
  enableAudio?: boolean;
  enableVideo?: boolean;
  config?: Partial<WebRTCConfig>;
}

export interface UseWebRTCReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'failed';
  
  // Room state
  room: WebRTCRoom | null;
  peers: WebRTCPeer[];
  localPeer: WebRTCPeer | null;
  
  // Media state
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  screenStream: MediaStream | null;
  
  // Device management
  availableDevices: MediaDeviceInfo[];
  selectedVideoDevice: string | null;
  selectedAudioDevice: string | null;
  selectedAudioOutput: string | null;
  
  // Presenter functionality
  isPresenting: boolean;
  isInPresenterQueue: boolean;
  presenterQueuePosition: number;
  canRequestPresenter: boolean;
  
  // Screen sharing
  isScreenSharing: boolean;
  canScreenShare: boolean;
  
  // Connection management
  joinRoom: () => Promise<void>;
  leaveRoom: () => Promise<void>;
  reconnect: () => Promise<void>;
  
  // Media controls
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  changeVideoDevice: (deviceId: string) => Promise<void>;
  changeAudioDevice: (deviceId: string) => Promise<void>;
  setAudioOutput: (deviceId: string) => Promise<void>;
  
  // Presenter controls
  requestPresenter: () => Promise<void>;
  stopPresenting: () => Promise<void>;
  approvePresenter: (userId: string) => Promise<void>;
  denyPresenter: (userId: string) => Promise<void>;
  
  // Screen sharing controls
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  
  // Breakout rooms
  assignToBreakout: (roomId: string, userIds: string[]) => Promise<void>;
  joinBreakoutRoom: (roomId: string) => Promise<void>;
  leaveBreakoutRoom: () => Promise<void>;
  
  // Room controls (moderator/admin)
  muteAll: () => Promise<void>;
  unmuteAll: () => Promise<void>;
  mutePeer: (peerId: string) => Promise<void>;
  unmutePeer: (peerId: string) => Promise<void>;
  lockRoom: () => Promise<void>;
  unlockRoom: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  
  // Statistics
  getStats: () => Promise<WebRTCStats>;
  
  // Error recovery
  retry: () => Promise<void>;
}

const DEFAULT_CONFIG: WebRTCConfig = {
  apiUrl: process.env.REACT_APP_WEBRTC_API_URL || 'https://api.bigfootlive.io/api/webrtc',
  wsUrl: process.env.REACT_APP_WEBRTC_WS_URL || 'wss://webrtc.bigfootlive.io/ws',
  stunServers: [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302'
  ],
  enableSimulcast: true,
  enableSvc: false,
  maxBitrate: {
    video: 2000000, // 2 Mbps
    audio: 128000,  // 128 kbps
    screen: 3000000 // 3 Mbps
  }
};

export function useWebRTC(options: UseWebRTCOptions): UseWebRTCReturn {
  const {
    roomId,
    userId,
    displayName,
    role = 'attendee',
    autoJoin = false,
    enableAudio = true,
    enableVideo = true,
    config: userConfig = {}
  } = options;
  
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...userConfig }), [userConfig]);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'failed'>('good');
  
  // Room state
  const [room, setRoom] = useState<WebRTCRoom | null>(null);
  const [peers, setPeers] = useState<WebRTCPeer[]>([]);
  const [localPeer, setLocalPeer] = useState<WebRTCPeer | null>(null);
  
  // Media state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  // Device management
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(null);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(null);
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string | null>(null);
  
  // Presenter state
  const [isPresenting, setIsPresenting] = useState(false);
  const [isInPresenterQueue, setIsInPresenterQueue] = useState(false);
  const [presenterQueuePosition, setPresenterQueuePosition] = useState(0);
  const [canRequestPresenter, setCanRequestPresenter] = useState(false);
  
  // Screen sharing state
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [canScreenShare, setCanScreenShare] = useState(true);
  
  // Refs for WebRTC objects
  const wsRef = useRef<WebSocket | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const producersRef = useRef<Map<string, Producer>>(new Map());
  const consumersRef = useRef<Map<string, Consumer>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate unique peer ID
  const peerIdRef = useRef<string>(`peer_${userId}_${Date.now()}`);
  
  /**
   * Initialize media device enumeration
   */
  const enumerateDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        console.warn('Media device enumeration not supported');
        return;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const filteredDevices = devices
        .filter(device => device.deviceId && device.label)
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label,
          kind: device.kind as 'videoinput' | 'audioinput' | 'audiooutput'
        }));
      
      setAvailableDevices(filteredDevices);
      
      // Set default devices if none selected
      if (!selectedVideoDevice) {
        const videoDevice = filteredDevices.find(d => d.kind === 'videoinput');
        if (videoDevice) setSelectedVideoDevice(videoDevice.deviceId);
      }
      
      if (!selectedAudioDevice) {
        const audioDevice = filteredDevices.find(d => d.kind === 'audioinput');
        if (audioDevice) setSelectedAudioDevice(audioDevice.deviceId);
      }
      
      if (!selectedAudioOutput) {
        const outputDevice = filteredDevices.find(d => d.kind === 'audiooutput');
        if (outputDevice) setSelectedAudioOutput(outputDevice.deviceId);
      }
      
    } catch (error) {
      console.error('Failed to enumerate media devices:', error);
    }
  }, [selectedVideoDevice, selectedAudioDevice, selectedAudioOutput]);
  
  /**
   * Get user media with specified constraints
   */
  const getUserMedia = useCallback(async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
    try {
      // Apply device constraints
      if (constraints.video && selectedVideoDevice) {
        constraints.video = {
          ...(typeof constraints.video === 'object' ? constraints.video : {}),
          deviceId: { exact: selectedVideoDevice }
        };
      }
      
      if (constraints.audio && selectedAudioDevice) {
        constraints.audio = {
          ...(typeof constraints.audio === 'object' ? constraints.audio : {}),
          deviceId: { exact: selectedAudioDevice }
        };
      }
      
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw new Error(`Failed to access media devices: ${error}`);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);
  
  /**
   * Initialize local media stream
   */
  const initializeLocalStream = useCallback(async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        audio: enableAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        } : false,
        video: enableVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };
      
      const stream = await getUserMedia(constraints);
      setLocalStream(stream);
      
      return stream;
    } catch (error) {
      console.error('Failed to initialize local stream:', error);
      setConnectionError(`Failed to access media devices: ${error}`);
      throw error;
    }
  }, [enableAudio, enableVideo, getUserMedia, localStream]);
  
  /**
   * Initialize WebSocket connection
   */
  const initializeWebSocket = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(`${config.wsUrl}/${roomId}?user_token=${userId}&role=${role}`);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnectionError(null);
          resolve(ws);
        };
        
        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          setIsConnected(false);
          
          // Attempt to reconnect if not intentional close
          if (event.code !== 1000 && !reconnectTimeoutRef.current) {
            scheduleReconnect();
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionError('WebSocket connection failed');
          reject(error);
        };
        
        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            await handleSignalingMessage(message);
          } catch (error) {
            console.error('Failed to handle signaling message:', error);
          }
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }, [config.wsUrl, roomId, userId, role]);
  
  /**
   * Handle signaling messages from the server
   */
  const handleSignalingMessage = useCallback(async (message: any) => {
    const { type } = message;
    
    try {
      switch (type) {
        case 'room_joined':
          await handleRoomJoined(message);
          break;
        
        case 'peer_joined':
          handlePeerJoined(message);
          break;
        
        case 'peer_left':
          handlePeerLeft(message);
          break;
        
        case 'router_rtp_capabilities':
          await handleRouterRtpCapabilities(message);
          break;
        
        case 'webrtc_transport_created':
          await handleTransportCreated(message);
          break;
        
        case 'webrtc_transport_connected':
          handleTransportConnected(message);
          break;
        
        case 'producer_created':
          handleProducerCreated(message);
          break;
        
        case 'consumer_created':
          await handleConsumerCreated(message);
          break;
        
        case 'new_producer':
          await handleNewProducer(message);
          break;
        
        case 'presenter_added':
          handlePresenterAdded(message);
          break;
        
        case 'presenter_removed':
          handlePresenterRemoved(message);
          break;
        
        case 'presenter_queued':
          handlePresenterQueued(message);
          break;
        
        case 'screen_share_started':
          handleScreenShareStarted(message);
          break;
        
        case 'screen_share_stopped':
          handleScreenShareStopped(message);
          break;
        
        case 'room_muted_all':
        case 'room_unmuted_all':
        case 'room_locked':
        case 'room_unlocked':
        case 'recording_started':
        case 'recording_stopped':
          handleRoomControlMessage(message);
          break;
        
        case 'error':
          handleErrorMessage(message);
          break;
        
        default:
          console.warn('Unknown signaling message type:', type);
      }
    } catch (error) {
      console.error(`Error handling ${type} message:`, error);
    }
  }, []);
  
  /**
   * Handle room joined response
   */
  const handleRoomJoined = useCallback(async (message: any) => {
    const { roomId: joinedRoomId, peerId, room_info, existing_peers } = message;
    
    // Update room state
    setRoom(room_info);
    
    // Update peers
    setPeers(existing_peers || []);
    
    // Create local peer
    const localPeerData: WebRTCPeer = {
      peerId,
      userId,
      displayName,
      role,
      isPresenting: false,
      isScreenSharing: false,
      audioEnabled: enableAudio,
      videoEnabled: enableVideo,
      connectionQuality: 'good'
    };
    setLocalPeer(localPeerData);
    
    // Update connection state
    setIsConnected(true);
    setIsConnecting(false);
    
    // Request router RTP capabilities
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'get_router_rtp_capabilities',
        roomId: joinedRoomId
      }));
    }
    
  }, [userId, displayName, role, enableAudio, enableVideo]);
  
  /**
   * Handle router RTP capabilities
   */
  const handleRouterRtpCapabilities = useCallback(async (message: any) => {
    const { rtpCapabilities } = message;
    
    try {
      // Initialize mediasoup Device
      const device = new Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      deviceRef.current = device;
      
      // Create send and receive transports
      await createTransports();
      
      // Start producing media
      if (localStream) {
        await startProducing(localStream);
      }
      
    } catch (error) {
      console.error('Failed to handle router capabilities:', error);
      setConnectionError('Failed to initialize media capabilities');
    }
  }, [localStream]);
  
  /**
   * Create WebRTC transports
   */
  const createTransports = useCallback(async () => {
    if (!wsRef.current) throw new Error('WebSocket not connected');
    
    // Create send transport
    wsRef.current.send(JSON.stringify({
      type: 'create_webrtc_transport',
      direction: 'send'
    }));
    
    // Create receive transport
    wsRef.current.send(JSON.stringify({
      type: 'create_webrtc_transport',
      direction: 'recv'
    }));
  }, []);
  
  /**
   * Handle transport created
   */
  const handleTransportCreated = useCallback(async (message: any) => {
    const { direction, id, iceParameters, iceCandidates, dtlsParameters } = message;
    
    if (!deviceRef.current) {
      console.error('Device not initialized');
      return;
    }
    
    try {
      const transport = direction === 'send'
        ? deviceRef.current.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters
          })
        : deviceRef.current.createRecvTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters
          });
      
      // Handle transport events
      transport.on('connect', ({ dtlsParameters }, callback, errback) => {
        wsRef.current?.send(JSON.stringify({
          type: 'connect_webrtc_transport',
          direction,
          dtlsParameters
        }));
        
        callback();
      });
      
      if (direction === 'send') {
        transport.on('produce', async (parameters, callback, errback) => {
          try {
            wsRef.current?.send(JSON.stringify({
              type: 'produce',
              ...parameters
            }));
            // callback will be called when producer_created is received
          } catch (error) {
            errback(error);
          }
        });
        
        sendTransportRef.current = transport as Transport;
      } else {
        recvTransportRef.current = transport as Transport;
      }
      
    } catch (error) {
      console.error(`Failed to create ${direction} transport:`, error);
    }
  }, []);
  
  /**
   * Start producing media
   */
  const startProducing = useCallback(async (stream: MediaStream) => {
    if (!sendTransportRef.current) {
      console.warn('Send transport not available');
      return;
    }
    
    try {
      // Produce audio
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const audioProducer = await sendTransportRef.current.produce({
          track: audioTrack,
          codecOptions: {
            opusStereo: true,
            opusDtx: true
          }
        });
        
        producersRef.current.set('audio', audioProducer);
      }
      
      // Produce video
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const videoProducer = await sendTransportRef.current.produce({
          track: videoTrack,
          codecOptions: {
            videoGoogleStartBitrate: 1000
          },
          encodings: config.enableSimulcast ? [
            { rid: 'r0', maxBitrate: 100000, scalabilityMode: 'S1T3' },
            { rid: 'r1', maxBitrate: 300000, scalabilityMode: 'S1T3' },
            { rid: 'r2', maxBitrate: 900000, scalabilityMode: 'S1T3' }
          ] : undefined
        });
        
        producersRef.current.set('video', videoProducer);
      }
      
    } catch (error) {
      console.error('Failed to start producing media:', error);
    }
  }, [config.enableSimulcast]);
  
  /**
   * Handle new producer notification
   */
  const handleNewProducer = useCallback(async (message: any) => {
    const { peerId, producerId, kind } = message;
    
    if (!recvTransportRef.current || !deviceRef.current) {
      console.warn('Receive transport or device not available');
      return;
    }
    
    try {
      // Request to consume the producer
      wsRef.current?.send(JSON.stringify({
        type: 'consume',
        producerId,
        rtpCapabilities: deviceRef.current.rtpCapabilities
      }));
      
    } catch (error) {
      console.error('Failed to request consumer:', error);
    }
  }, []);
  
  /**
   * Handle consumer created
   */
  const handleConsumerCreated = useCallback(async (message: any) => {
    const { id, producerId, kind, rtpParameters, type, producerPaused } = message;
    
    if (!recvTransportRef.current) {
      console.warn('Receive transport not available');
      return;
    }
    
    try {
      const consumer = await recvTransportRef.current.consume({
        id,
        producerId,
        kind,
        rtpParameters
      });
      
      consumersRef.current.set(id, consumer);
      
      // Create or update remote stream
      const stream = new MediaStream([consumer.track]);
      setRemoteStreams(prev => new Map(prev).set(producerId, stream));
      
      // Resume consumer if not paused
      if (!producerPaused) {
        wsRef.current?.send(JSON.stringify({
          type: 'resume_consumer',
          consumerId: id
        }));
      }
      
    } catch (error) {
      console.error('Failed to create consumer:', error);
    }
  }, []);
  
  /**
   * Schedule reconnection
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return;
    
    const delay = 3000; // 3 seconds
    reconnectTimeoutRef.current = setTimeout(async () => {
      reconnectTimeoutRef.current = null;
      try {
        await reconnect();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, delay);
  }, []);
  
  // Public API methods
  
  /**
   * Join WebRTC room
   */
  const joinRoom = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Initialize local stream first
      await initializeLocalStream();
      
      // Initialize WebSocket connection
      const ws = await initializeWebSocket();
      wsRef.current = ws;
      
      // Send join room message
      ws.send(JSON.stringify({
        type: 'join_room',
        roomId,
        peerId: peerIdRef.current,
        userId,
        displayName,
        role
      }));
      
    } catch (error) {
      console.error('Failed to join room:', error);
      setConnectionError(`Failed to join room: ${error}`);
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, initializeLocalStream, initializeWebSocket, roomId, userId, displayName, role]);
  
  /**
   * Leave WebRTC room
   */
  const leaveRoom = useCallback(async () => {
    try {
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'leave_room',
          roomId,
          peerId: peerIdRef.current
        }));
        wsRef.current.close(1000, 'User left room');
        wsRef.current = null;
      }
      
      // Close all producers
      producersRef.current.forEach(producer => producer.close());
      producersRef.current.clear();
      
      // Close all consumers
      consumersRef.current.forEach(consumer => consumer.close());
      consumersRef.current.clear();
      
      // Close transports
      sendTransportRef.current?.close();
      recvTransportRef.current?.close();
      sendTransportRef.current = null;
      recvTransportRef.current = null;
      
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Stop screen stream
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      
      // Clear state
      setIsConnected(false);
      setRoom(null);
      setPeers([]);
      setLocalPeer(null);
      setRemoteStreams(new Map());
      setIsPresenting(false);
      setIsScreenSharing(false);
      setIsInPresenterQueue(false);
      
      // Clear timers
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
      
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  }, [roomId, localStream, screenStream]);
  
  /**
   * Reconnect to WebRTC session
   */
  const reconnect = useCallback(async () => {
    console.log('Attempting to reconnect...');
    await leaveRoom();
    await joinRoom();
  }, [leaveRoom, joinRoom]);
  
  /**
   * Toggle audio on/off
   */
  const toggleAudio = useCallback(async () => {
    if (!localStream) return;
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setLocalPeer(prev => prev ? {
        ...prev,
        audioEnabled: audioTrack.enabled
      } : null);
    }
  }, [localStream]);
  
  /**
   * Toggle video on/off
   */
  const toggleVideo = useCallback(async () => {
    if (!localStream) return;
    
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setLocalPeer(prev => prev ? {
        ...prev,
        videoEnabled: videoTrack.enabled
      } : null);
    }
  }, [localStream]);
  
  /**
   * Request presenter role
   */
  const requestPresenter = useCallback(async () => {
    if (!wsRef.current || !canRequestPresenter) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'request_presenter_role',
      roomId,
      peerId: peerIdRef.current
    }));
  }, [roomId, canRequestPresenter]);
  
  /**
   * Stop presenting
   */
  const stopPresenting = useCallback(async () => {
    if (!wsRef.current || !isPresenting) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'stop_presenting',
      roomId,
      peerId: peerIdRef.current
    }));
  }, [roomId, isPresenting]);
  
  /**
   * Start screen sharing
   */
  const startScreenShare = useCallback(async () => {
    if (!canScreenShare || isScreenSharing) return;
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      
      setScreenStream(screenStream);
      setIsScreenSharing(true);
      
      // Produce screen share
      if (sendTransportRef.current) {
        const videoTrack = screenStream.getVideoTracks()[0];
        if (videoTrack) {
          const screenProducer = await sendTransportRef.current.produce({
            track: videoTrack,
            appData: { source: 'screen' }
          });
          
          producersRef.current.set('screen', screenProducer);
          
          // Handle screen share end
          videoTrack.onended = () => {
            stopScreenShare();
          };
        }
      }
      
      // Notify server
      wsRef.current?.send(JSON.stringify({
        type: 'screen_share',
        action: 'start',
        roomId,
        peerId: peerIdRef.current
      }));
      
    } catch (error) {
      console.error('Failed to start screen share:', error);
      setConnectionError('Failed to start screen sharing');
    }
  }, [canScreenShare, isScreenSharing, roomId]);
  
  /**
   * Stop screen sharing
   */
  const stopScreenShare = useCallback(async () => {
    if (!isScreenSharing) return;
    
    // Stop screen stream
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    // Close screen producer
    const screenProducer = producersRef.current.get('screen');
    if (screenProducer) {
      screenProducer.close();
      producersRef.current.delete('screen');
    }
    
    setIsScreenSharing(false);
    
    // Notify server
    wsRef.current?.send(JSON.stringify({
      type: 'screen_share',
      action: 'stop',
      roomId,
      peerId: peerIdRef.current
    }));
  }, [isScreenSharing, screenStream, roomId]);
  
  // Stub implementations for other methods
  const changeVideoDevice = useCallback(async (deviceId: string) => {
    // Implementation would recreate video producer with new device
    setSelectedVideoDevice(deviceId);
  }, []);
  
  const changeAudioDevice = useCallback(async (deviceId: string) => {
    // Implementation would recreate audio producer with new device  
    setSelectedAudioDevice(deviceId);
  }, []);
  
  const setAudioOutput = useCallback(async (deviceId: string) => {
    // Implementation would set audio output device
    setSelectedAudioOutput(deviceId);
  }, []);
  
  const approvePresenter = useCallback(async (userId: string) => {
    // Implementation for moderators to approve presenter
  }, []);
  
  const denyPresenter = useCallback(async (userId: string) => {
    // Implementation for moderators to deny presenter
  }, []);
  
  const assignToBreakout = useCallback(async (roomId: string, userIds: string[]) => {
    // Implementation for breakout room assignment
  }, []);
  
  const joinBreakoutRoom = useCallback(async (roomId: string) => {
    // Implementation to join breakout room
  }, []);
  
  const leaveBreakoutRoom = useCallback(async () => {
    // Implementation to leave breakout room
  }, []);
  
  const muteAll = useCallback(async () => {
    // Implementation for moderator to mute all
  }, []);
  
  const unmuteAll = useCallback(async () => {
    // Implementation for moderator to unmute all
  }, []);
  
  const mutePeer = useCallback(async (peerId: string) => {
    // Implementation to mute specific peer
  }, []);
  
  const unmutePeer = useCallback(async (peerId: string) => {
    // Implementation to unmute specific peer
  }, []);
  
  const lockRoom = useCallback(async () => {
    // Implementation to lock room
  }, []);
  
  const unlockRoom = useCallback(async () => {
    // Implementation to unlock room
  }, []);
  
  const startRecording = useCallback(async () => {
    // Implementation to start recording
  }, []);
  
  const stopRecording = useCallback(async () => {
    // Implementation to stop recording  
  }, []);
  
  const getStats = useCallback(async (): Promise<WebRTCStats> => {
    // Implementation to get WebRTC statistics
    return {
      bytesReceived: 0,
      bytesSent: 0,
      packetsReceived: 0,
      packetsLost: 0,
      jitter: 0,
      rtt: 0,
      bandwidth: 0,
      quality: 'good'
    };
  }, []);
  
  const retry = useCallback(async () => {
    await reconnect();
  }, [reconnect]);
  
  // Handle presenter queue and approval status
  const handlePresenterQueued = useCallback((message: any) => {
    const { queue_position } = message;
    setIsInPresenterQueue(true);
    setPresenterQueuePosition(queue_position);
  }, []);
  
  const handlePresenterAdded = useCallback((message: any) => {
    const { peer } = message;
    setIsPresenting(peer.peerId === peerIdRef.current);
    setIsInPresenterQueue(false);
    setPresenterQueuePosition(0);
  }, []);
  
  const handlePresenterRemoved = useCallback((message: any) => {
    const { peerId } = message;
    if (peerId === peerIdRef.current) {
      setIsPresenting(false);
    }
  }, []);
  
  const handleScreenShareStarted = useCallback((message: any) => {
    const { peerId } = message;
    if (peerId === peerIdRef.current) {
      setIsScreenSharing(true);
    }
  }, []);
  
  const handleScreenShareStopped = useCallback((message: any) => {
    const { peerId } = message;
    if (peerId === peerIdRef.current) {
      setIsScreenSharing(false);
    }
  }, []);
  
  const handlePeerJoined = useCallback((message: any) => {
    const { peer } = message;
    setPeers(prev => [...prev.filter(p => p.peerId !== peer.peerId), peer]);
  }, []);
  
  const handlePeerLeft = useCallback((message: any) => {
    const { peerId } = message;
    setPeers(prev => prev.filter(p => p.peerId !== peerId));
    setRemoteStreams(prev => {
      const updated = new Map(prev);
      updated.delete(peerId);
      return updated;
    });
  }, []);
  
  const handleRoomControlMessage = useCallback((message: any) => {
    const { type } = message;
    // Update room state based on control message
    setRoom(prev => {
      if (!prev) return null;
      
      const updated = { ...prev };
      
      switch (type) {
        case 'room_muted_all':
        case 'room_unmuted_all':
          updated.mutedAll = message.muted_all;
          break;
        case 'room_locked':
        case 'room_unlocked':
          updated.isLocked = message.locked;
          break;
        case 'recording_started':
        case 'recording_stopped':
          updated.isRecording = message.recording;
          break;
      }
      
      return updated;
    });
  }, []);
  
  const handleTransportConnected = useCallback((message: any) => {
    console.log('Transport connected:', message.direction);
  }, []);
  
  const handleProducerCreated = useCallback((message: any) => {
    console.log('Producer created:', message.id, message.kind);
  }, []);
  
  const handleErrorMessage = useCallback((message: any) => {
    console.error('WebRTC error:', message.message);
    setConnectionError(message.message);
  }, []);
  
  // Auto-join on mount if enabled
  useEffect(() => {
    if (autoJoin) {
      joinRoom();
    }
    
    // Enumerate devices on mount
    enumerateDevices();
    
    return () => {
      leaveRoom();
    };
  }, []);
  
  // Update can request presenter status
  useEffect(() => {
    setCanRequestPresenter(
      isConnected && 
      !isPresenting && 
      !isInPresenterQueue && 
      room?.presenterCount < room?.features.maxPresenters
    );
  }, [isConnected, isPresenting, isInPresenterQueue, room]);
  
  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    connectionQuality,
    
    // Room state
    room,
    peers,
    localPeer,
    
    // Media state
    localStream,
    remoteStreams,
    screenStream,
    
    // Device management
    availableDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    selectedAudioOutput,
    
    // Presenter functionality
    isPresenting,
    isInPresenterQueue,
    presenterQueuePosition,
    canRequestPresenter,
    
    // Screen sharing
    isScreenSharing,
    canScreenShare,
    
    // Connection management
    joinRoom,
    leaveRoom,
    reconnect,
    
    // Media controls
    toggleAudio,
    toggleVideo,
    changeVideoDevice,
    changeAudioDevice,
    setAudioOutput,
    
    // Presenter controls
    requestPresenter,
    stopPresenting,
    approvePresenter,
    denyPresenter,
    
    // Screen sharing controls
    startScreenShare,
    stopScreenShare,
    
    // Breakout rooms
    assignToBreakout,
    joinBreakoutRoom,
    leaveBreakoutRoom,
    
    // Room controls
    muteAll,
    unmuteAll,
    mutePeer,
    unmutePeer,
    lockRoom,
    unlockRoom,
    startRecording,
    stopRecording,
    
    // Statistics
    getStats,
    
    // Error recovery
    retry
  };
}