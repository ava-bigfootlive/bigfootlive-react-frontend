import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { clearFeatureFlagCache } from '@/hooks/useFeatureFlag';

interface FeatureFlagContextValue {
  flags: Map<string, any>;
  loading: boolean;
  error?: Error;
  refreshFlags: () => Promise<void>;
  evaluateFlag: (key: string) => boolean;
  getFlag: (key: string) => any;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

/**
 * Feature Flag Provider
 * Manages feature flags at the application level
 */
export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const { user, tenant } = useAuth();
  // Use WebSocket in silent mode, no auto-connect for feature flags
  const { subscribe, unsubscribe } = useWebSocket({ autoConnect: false, silent: true });
  const [flags, setFlags] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  // Fetch all flags for the current user/tenant
  const fetchFlags = useCallback(async () => {
    if (!user) {
      setFlags(new Map());
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await api.post('/api/feature-flags/evaluate/all', {
        context: {
          userId: user.id,
          tenantId: tenant,
          tenantTier: user?.tenantId ? 'basic' : undefined, // TODO: Get actual tier from API
        },
      });

      const flagMap = new Map<string, any>();
      for (const [key, value] of Object.entries(response.data)) {
        flagMap.set(key, value);
      }
      setFlags(flagMap);
    } catch (err) {
      console.error('Error fetching feature flags:', err);
      setError(err as Error);
      setFlags(new Map());
    } finally {
      setLoading(false);
    }
  }, [user, tenant]);

  // Evaluate a specific flag
  const evaluateFlag = useCallback((key: string): boolean => {
    const flag = flags.get(key);
    return flag?.enabled || false;
  }, [flags]);

  // Get complete flag data
  const getFlag = useCallback((key: string): any => {
    return flags.get(key) || { enabled: false };
  }, [flags]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (!user) return;

    const handleFlagUpdate = (data: any) => {
      // Refresh flags when an update is received
      fetchFlags();
    };

    const unsubscribe1 = subscribe('feature_flag_update', handleFlagUpdate);
    const unsubscribe2 = subscribe('feature_flag_override', handleFlagUpdate);
    const unsubscribe3 = subscribe('experiment_status_change', handleFlagUpdate);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }, [user, subscribe, unsubscribe, fetchFlags]);

  // Fetch flags when user/tenant changes
  useEffect(() => {
    if (user) {
      fetchFlags();
    } else {
      // Clear flags and cache when user logs out
      setFlags(new Map());
      clearFeatureFlagCache();
    }
  }, [user, tenant, fetchFlags]);

  // Refresh flags function
  const refreshFlags = async () => {
    clearFeatureFlagCache();
    await fetchFlags();
  };

  const value: FeatureFlagContextValue = {
    flags,
    loading,
    error,
    refreshFlags,
    evaluateFlag,
    getFlag,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to use the Feature Flag Context
 */
export function useFeatureFlagContext() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
  }
  return context;
}

/**
 * HOC to wrap components with feature flag provider
 */
export function withFeatureFlagProvider<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => (
    <FeatureFlagProvider>
      <Component {...props} />
    </FeatureFlagProvider>
  );
}

export default FeatureFlagProvider;