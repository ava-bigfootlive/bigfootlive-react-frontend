/**
 * Custom hooks for caption management and WebSocket integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

// Types
export interface CaptionSegment {
  id: string;
  session_id: string;
  start_time: number;
  end_time: number;
  duration: number;
  original_text: string;
  corrected_text?: string;
  final_text: string;
  confidence: number;
  language: string;
  speaker_id?: string;
  speaker_name?: string;
  is_corrected: boolean;
  needs_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaptionSession {
  id: string;
  tenant_id: string;
  event_id: string;
  container_id?: string;
  primary_language: string;
  provider: string;
  status: 'starting' | 'active' | 'paused' | 'stopped' | 'error';
  started_at: string;
  ended_at?: string;
  segment_count: number;
  correction_count: number;
  average_confidence?: number;
  created_by: string;
}

export interface CaptionSettings {
  id?: string;
  tenant_id: string;
  event_id?: string;
  user_id?: string;
  primary_provider: string;
  fallback_provider?: string;
  primary_language: string;
  enabled_languages?: string[];
  font_family: string;
  font_size: number;
  font_color: string;
  background_color: string;
  background_opacity: number;
  position: 'top' | 'bottom' | 'center' | 'custom';
  custom_position?: { x: number; y: number };
  enable_profanity_filter: boolean;
  enable_punctuation: boolean;
  enable_speaker_identification: boolean;
  enable_translation: boolean;
  confidence_threshold: number;
  max_segment_duration: number;
}

export interface CaptionCorrection {
  id: string;
  segment_id: string;
  session_id: string;
  original_text: string;
  corrected_text: string;
  correction_type: string;
  corrected_by: string;
  corrected_at: string;
  is_approved: boolean;
}

// API endpoints
const API_BASE = '/api/captions';

/**
 * Hook for managing caption sessions
 */
export const useCaptionSession = (sessionId?: string) => {
  const [session, setSession] = useState<CaptionSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async (id: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/sessions/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const sessionData = await response.json();
      setSession(sessionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
      console.error('Failed to fetch caption session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = useCallback(async (eventId: string, containerId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          container_id: containerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const newSession = await response.json();
      setSession(newSession);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
      console.error('Failed to start caption session:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const stopSession = useCallback(async (id: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/sessions/${id}/stop`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedSession = await response.json();
      setSession(updatedSession);
      return updatedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop session');
      console.error('Failed to stop caption session:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pauseSession = useCallback(async (id: string) => {
    if (!id) return;

    try {
      const response = await fetch(`${API_BASE}/sessions/${id}/pause`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedSession = await response.json();
      setSession(updatedSession);
      return updatedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause session');
      throw err;
    }
  }, []);

  const resumeSession = useCallback(async (id: string) => {
    if (!id) return;

    try {
      const response = await fetch(`${API_BASE}/sessions/${id}/resume`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedSession = await response.json();
      setSession(updatedSession);
      return updatedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume session');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId, fetchSession]);

  return {
    session,
    loading,
    error,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    refetch: () => sessionId && fetchSession(sessionId),
  };
};

/**
 * Hook for managing caption segments with real-time updates
 */
export const useCaptionSegments = (sessionId: string) => {
  const [segments, setSegments] = useState<CaptionSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebSocket for real-time caption updates
  const { isConnected, messages } = useWebSocket(
    sessionId ? `ws://localhost:8000/captions/sessions/${sessionId}/live` : null,
    {
      onMessage: (message) => {
        if (message.type === 'captions' && message.captions) {
          setSegments(prevSegments => {
            const newSegments = [...prevSegments];
            
            message.captions.forEach((caption: CaptionSegment) => {
              const existingIndex = newSegments.findIndex(s => s.id === caption.id);
              if (existingIndex >= 0) {
                newSegments[existingIndex] = caption;
              } else {
                newSegments.push(caption);
              }
            });

            // Sort by start time and keep only recent segments
            return newSegments
              .sort((a, b) => a.start_time - b.start_time)
              .slice(-200); // Keep last 200 segments
          });
        }
      },
    }
  );

  const fetchSegments = useCallback(async (
    startTime?: number,
    endTime?: number,
    limit = 100
  ) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (startTime !== undefined) {
        params.set('start_time', startTime.toString());
      }
      if (endTime !== undefined) {
        params.set('end_time', endTime.toString());
      }

      const response = await fetch(`${API_BASE}/sessions/${sessionId}/segments?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const segmentData = await response.json();
      setSegments(segmentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch segments');
      console.error('Failed to fetch caption segments:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Get segments visible at current time
  const getVisibleSegments = useCallback((currentTime: number, maxLines = 3) => {
    return segments
      .filter(segment => 
        segment.start_time <= currentTime && segment.end_time >= currentTime
      )
      .slice(-maxLines);
  }, [segments]);

  // Get segments in time range
  const getSegmentsInRange = useCallback((startTime: number, endTime: number) => {
    return segments.filter(segment =>
      segment.start_time >= startTime && segment.end_time <= endTime
    );
  }, [segments]);

  useEffect(() => {
    if (sessionId) {
      fetchSegments();
    }
  }, [sessionId, fetchSegments]);

  return {
    segments,
    loading,
    error,
    isConnected,
    fetchSegments,
    getVisibleSegments,
    getSegmentsInRange,
  };
};

/**
 * Hook for managing caption corrections
 */
export const useCaptionCorrections = (sessionId: string) => {
  const [corrections, setCorrections] = useState<CaptionCorrection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebSocket for real-time correction updates
  const { isConnected } = useWebSocket(
    sessionId ? `ws://localhost:8000/captions/sessions/${sessionId}/corrections` : null,
    {
      onMessage: (message) => {
        if (message.type === 'correction') {
          setCorrections(prev => [...prev, message.correction]);
        }
      },
    }
  );

  const fetchCorrections = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/corrections`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const correctionData = await response.json();
      setCorrections(correctionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch corrections');
      console.error('Failed to fetch corrections:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const createCorrection = useCallback(async (
    segmentId: string,
    correctedText: string,
    timingAdjustment?: {
      corrected_start_time?: number;
      corrected_end_time?: number;
    }
  ) => {
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/segments/${segmentId}/corrections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          corrected_text: correctedText,
          ...timingAdjustment,
          correction_reason: 'Manual correction',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const newCorrection = await response.json();
      setCorrections(prev => [...prev, newCorrection]);
      return newCorrection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create correction');
      console.error('Failed to create correction:', err);
      throw err;
    }
  }, []);

  const approveCorrection = useCallback(async (correctionId: string) => {
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/corrections/${correctionId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setCorrections(prev =>
        prev.map(correction =>
          correction.id === correctionId
            ? { ...correction, is_approved: true }
            : correction
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve correction');
      console.error('Failed to approve correction:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchCorrections();
    }
  }, [sessionId, fetchCorrections]);

  return {
    corrections,
    loading,
    error,
    isConnected,
    createCorrection,
    approveCorrection,
    refetch: fetchCorrections,
  };
};

/**
 * Hook for managing caption settings
 */
export const useCaptionSettings = (eventId?: string, userId?: string) => {
  const [settings, setSettings] = useState<CaptionSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (eventId) params.set('event_id', eventId);
      if (userId) params.set('user_id', userId);

      const response = await fetch(`${API_BASE}/settings?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const settingsData = await response.json();
      setSettings(settingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, userId]);

  const saveSettings = useCallback(async (settingsData: Partial<CaptionSettings>) => {
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const newSettings = await response.json();
      
      setSettings(prev => {
        const existingIndex = prev.findIndex(s => 
          s.event_id === newSettings.event_id && 
          s.user_id === newSettings.user_id
        );
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newSettings;
          return updated;
        } else {
          return [...prev, newSettings];
        }
      });

      return newSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      console.error('Failed to save settings:', err);
      throw err;
    }
  }, []);

  // Get default settings for display
  const getDefaultSettings = useCallback((): CaptionSettings => {
    // Return tenant default or user default
    const tenantDefault = settings.find(s => !s.event_id && !s.user_id);
    const userDefault = settings.find(s => !s.event_id && s.user_id === userId);
    const eventDefault = settings.find(s => s.event_id === eventId);

    return eventDefault || userDefault || tenantDefault || {
      tenant_id: '',
      primary_provider: 'aws_transcribe',
      primary_language: 'en-US',
      font_family: 'Arial, sans-serif',
      font_size: 16,
      font_color: '#FFFFFF',
      background_color: '#000000',
      background_opacity: 0.8,
      position: 'bottom',
      enable_profanity_filter: true,
      enable_punctuation: true,
      enable_speaker_identification: false,
      enable_translation: false,
      confidence_threshold: 0.7,
      max_segment_duration: 30,
    };
  }, [settings, eventId, userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    getDefaultSettings,
    refetch: fetchSettings,
  };
};

/**
 * Hook for caption export functionality
 */
export const useCaptionExport = () => {
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExport = useCallback(async (
    sessionId: string,
    format: 'webvtt' | 'srt' | 'json',
    language: string,
    options?: {
      include_timestamps?: boolean;
      include_speaker_labels?: boolean;
      include_confidence_scores?: boolean;
      start_time?: number;
      end_time?: number;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/exports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          language,
          include_timestamps: options?.include_timestamps ?? true,
          include_speaker_labels: options?.include_speaker_labels ?? true,
          include_confidence_scores: options?.include_confidence_scores ?? false,
          start_time: options?.start_time,
          end_time: options?.end_time,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const exportData = await response.json();
      setExports(prev => [...prev, exportData]);
      return exportData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create export');
      console.error('Failed to create export:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getExportStatus = useCallback(async (exportId: string) => {
    try {
      const response = await fetch(`${API_BASE}/exports/${exportId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const exportData = await response.json();
      
      setExports(prev =>
        prev.map(exp => 
          exp.id === exportId ? exportData : exp
        )
      );

      return exportData;
    } catch (err) {
      console.error('Failed to get export status:', err);
      throw err;
    }
  }, []);

  return {
    exports,
    loading,
    error,
    createExport,
    getExportStatus,
  };
};

/**
 * Combined hook for complete caption functionality
 */
export const useCaptions = (sessionId?: string, eventId?: string) => {
  const sessionHook = useCaptionSession(sessionId);
  const segmentsHook = useCaptionSegments(sessionId || '');
  const correctionsHook = useCaptionCorrections(sessionId || '');
  const settingsHook = useCaptionSettings(eventId);
  const exportHook = useCaptionExport();

  return {
    session: sessionHook,
    segments: segmentsHook,
    corrections: correctionsHook,
    settings: settingsHook,
    export: exportHook,
  };
};