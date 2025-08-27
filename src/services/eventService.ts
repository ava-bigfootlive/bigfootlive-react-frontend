/**
 * Event Service - Handles live event creation and management
 */

import apiClient from './api';

export interface LiveEvent {
  id: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  stream_key: string;
  rtmp_url?: string;
  rtmps_url: string;
  hls_url?: string;
  container_id?: string;
  scheduled_start?: string;
  actual_start?: string;
  actual_end?: string;
  viewer_count?: number;
  max_viewers?: number;
  recording_enabled: boolean;
  chat_enabled: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  scheduled_start?: string;
  recording_enabled?: boolean;
  chat_enabled?: boolean;
  require_auth?: boolean;
  max_viewers?: number;
}

export interface EventStats {
  event_id: string;
  viewer_count: number;
  max_viewers: number;
  chat_messages: number;
  reactions: number;
  bandwidth_usage: number;
  stream_health: {
    bitrate: number;
    fps: number;
    dropped_frames: number;
    latency: number;
  };
}

export interface EventContainer {
  event_id: string;
  container_id: string;
  status: 'starting' | 'running' | 'stopping' | 'stopped';
  rtmp_port: number;
  rtmps_port: number;
  hls_port: number;
  chat_port: number;
  metrics_port: number;
  public_ip?: string;
  private_ip?: string;
  created_at: string;
}

class EventService {
  private baseUrl = '/api/v1/events';
  private containerUrl = '/api/v1/containers';

  /**
   * Create a new live event
   */
  async createEvent(data: CreateEventRequest): Promise<LiveEvent> {
    const response = await apiClient.request(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    // Generate RTMPS URL
    if (response.stream_key) {
      response.rtmps_url = this.buildRtmpsUrl(response.id, response.stream_key);
      response.hls_url = this.buildHlsUrl(response.id);
    }

    return response;
  }

  /**
   * Get event details
   */
  async getEvent(eventId: string): Promise<LiveEvent> {
    const response = await apiClient.request(`${this.baseUrl}/${eventId}`);
    
    // Add streaming URLs
    if (response.stream_key) {
      response.rtmps_url = this.buildRtmpsUrl(response.id, response.stream_key);
      response.hls_url = this.buildHlsUrl(response.id);
    }
    
    return response;
  }

  /**
   * List user's events
   */
  async listEvents(
    status?: 'scheduled' | 'live' | 'ended',
    skip: number = 0,
    limit: number = 20
  ): Promise<{ items: LiveEvent[]; total: number }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.request(`${this.baseUrl}?${params.toString()}`);
    
    // Add streaming URLs to each event
    response.items = response.items.map((event: LiveEvent) => {
      if (event.stream_key) {
        event.rtmps_url = this.buildRtmpsUrl(event.id, event.stream_key);
        event.hls_url = this.buildHlsUrl(event.id);
      }
      return event;
    });
    
    return response;
  }

  /**
   * Start live event (spins up container)
   */
  async startEvent(eventId: string): Promise<EventContainer> {
    return apiClient.request(`${this.baseUrl}/${eventId}/start`, {
      method: 'POST'
    });
  }

  /**
   * Stop live event (stops container and archives)
   */
  async stopEvent(eventId: string): Promise<void> {
    return apiClient.request(`${this.baseUrl}/${eventId}/stop`, {
      method: 'POST'
    });
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string): Promise<EventStats> {
    return apiClient.request(`${this.baseUrl}/${eventId}/stats`);
  }

  /**
   * Get event container info
   */
  async getEventContainer(eventId: string): Promise<EventContainer> {
    return apiClient.request(`${this.containerUrl}/event/${eventId}`);
  }

  /**
   * Update event details
   */
  async updateEvent(eventId: string, data: Partial<CreateEventRequest>): Promise<LiveEvent> {
    return apiClient.request(`${this.baseUrl}/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * Delete/cancel event
   */
  async deleteEvent(eventId: string): Promise<void> {
    return apiClient.request(`${this.baseUrl}/${eventId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Build RTMPS streaming URL
   */
  private buildRtmpsUrl(eventId: string, streamKey: string): string {
    // In production, this would be the event container's public IP/domain
    // For now, using placeholder that would be replaced when container starts
    return `rtmps://stream.bigfootlive.io:1936/live/${streamKey}`;
  }

  /**
   * Build HLS playback URL
   */
  private buildHlsUrl(eventId: string): string {
    // CloudFront CDN URL for HLS streams
    const cdnUrl = 'https://d39hsmqppuzm82.cloudfront.net';
    return `${cdnUrl}/live/${eventId}/playlist.m3u8`;
  }

  /**
   * Test RTMP connection
   */
  async testConnection(rtmpsUrl: string, streamKey: string): Promise<boolean> {
    try {
      // This would call a backend endpoint that tests the RTMP connection
      const response = await apiClient.request('/api/v1/events/test-connection', {
        method: 'POST',
        body: JSON.stringify({ rtmps_url: rtmpsUrl, stream_key: streamKey })
      });
      return response.connected;
    } catch {
      return false;
    }
  }

  /**
   * Get streaming recommendations based on bandwidth
   */
  getStreamingRecommendations(uploadBandwidthMbps: number): {
    resolution: string;
    bitrate: string;
    fps: number;
  } {
    if (uploadBandwidthMbps >= 10) {
      return { resolution: '1920x1080', bitrate: '5000k', fps: 60 };
    } else if (uploadBandwidthMbps >= 5) {
      return { resolution: '1920x1080', bitrate: '4000k', fps: 30 };
    } else if (uploadBandwidthMbps >= 3) {
      return { resolution: '1280x720', bitrate: '2500k', fps: 30 };
    } else if (uploadBandwidthMbps >= 2) {
      return { resolution: '854x480', bitrate: '1000k', fps: 30 };
    } else {
      return { resolution: '640x360', bitrate: '600k', fps: 30 };
    }
  }

  /**
   * Convert live event recording to VOD
   */
  async convertToVod(eventId: string): Promise<{ jobId: string; mediaId: string }> {
    return apiClient.request(`${this.baseUrl}/${eventId}/convert-to-vod`, {
      method: 'POST'
    });
  }
}

export default new EventService();