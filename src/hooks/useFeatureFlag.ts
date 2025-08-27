import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';

// Types
export interface FeatureFlagEvaluation {
  enabled: boolean;
  variant?: string;
  config?: Record<string, any>;
  source?: string;
  experiment?: {
    id: string;
    name: string;
    variant: string;
  };
}

export interface FeatureFlagContext {
  tenantId?: string;
  userId?: string;
  tenantTier?: string;
  region?: string;
  customAttributes?: Record<string, any>;
}

// Cache for evaluated flags
const flagCache = new Map<string, FeatureFlagEvaluation>();
const cacheTimestamps = new Map<string, number>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Pending evaluations to batch API calls
const pendingEvaluations = new Map<string, Promise<FeatureFlagEvaluation>>();

// WebSocket subscription tracking
const wsSubscriptions = new Set<string>();

/**
 * Hook to evaluate and monitor a feature flag
 * 
 * @param flagKey - The feature flag key to evaluate
 * @param context - Optional context for evaluation
 * @returns The evaluation result with helper methods
 */
export function useFeatureFlag(
  flagKey: string,
  context?: FeatureFlagContext
): {
  isEnabled: boolean;
  variant?: string;
  config?: Record<string, any>;
  loading: boolean;
  error?: Error;
  refresh: () => void;
  experiment?: {
    id: string;
    name: string;
    variant: string;
  };
} {
  const { user, tenant } = useAuth();
  const { subscribe, unsubscribe } = useWebSocket();
  
  const [evaluation, setEvaluation] = useState<FeatureFlagEvaluation | null>(() => {
    // Check cache first
    const cached = getCachedEvaluation(flagKey);
    return cached || null;
  });
  
  const [loading, setLoading] = useState(!evaluation);
  const [error, setError] = useState<Error | undefined>();

  // Build evaluation context
  const evaluationContext = useMemo(() => ({
    userId: user?.id,
    tenantId: tenant?.id || context?.tenantId,
    tenantTier: tenant?.subscription_tier || context?.tenantTier,
    region: context?.region,
    ...context?.customAttributes,
  }), [user, tenant, context]);

  // Evaluate the flag
  const evaluateFlag = useCallback(async (force = false) => {
    try {
      // Check cache unless forced refresh
      if (!force) {
        const cached = getCachedEvaluation(flagKey);
        if (cached) {
          setEvaluation(cached);
          setLoading(false);
          return cached;
        }
      }

      // Check if there's already a pending evaluation
      if (pendingEvaluations.has(flagKey)) {
        const result = await pendingEvaluations.get(flagKey)!;
        setEvaluation(result);
        setLoading(false);
        return result;
      }

      setLoading(true);
      setError(undefined);

      // Create the evaluation promise
      const evaluationPromise = api.post('/api/feature-flags/evaluate', {
        flag_keys: [flagKey],
        context: evaluationContext,
      }).then(response => {
        const result = response.data[flagKey] || { enabled: false };
        
        // Cache the result
        setCachedEvaluation(flagKey, result);
        
        // Clean up pending evaluation
        pendingEvaluations.delete(flagKey);
        
        return result;
      });

      // Store as pending
      pendingEvaluations.set(flagKey, evaluationPromise);

      const result = await evaluationPromise;
      setEvaluation(result);
      setLoading(false);
      
      return result;
    } catch (err) {
      console.error(`Error evaluating feature flag ${flagKey}:`, err);
      setError(err as Error);
      setLoading(false);
      
      // Clean up pending evaluation
      pendingEvaluations.delete(flagKey);
      
      // Return safe default
      return { enabled: false };
    }
  }, [flagKey, evaluationContext]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (!flagKey) return;

    // Subscribe to flag updates
    const subscriptionKey = `feature_flag:${flagKey}`;
    
    if (!wsSubscriptions.has(subscriptionKey)) {
      wsSubscriptions.add(subscriptionKey);
      
      subscribe('feature_flag_update', (data: any) => {
        if (data.flag_key === flagKey) {
          // Invalidate cache
          flagCache.delete(flagKey);
          cacheTimestamps.delete(flagKey);
          
          // Re-evaluate
          evaluateFlag(true);
        }
      });
    }

    return () => {
      wsSubscriptions.delete(subscriptionKey);
      unsubscribe('feature_flag_update');
    };
  }, [flagKey, subscribe, unsubscribe, evaluateFlag]);

  // Initial evaluation
  useEffect(() => {
    evaluateFlag();
  }, [evaluateFlag]);

  // Refresh function
  const refresh = useCallback(() => {
    evaluateFlag(true);
  }, [evaluateFlag]);

  return {
    isEnabled: evaluation?.enabled || false,
    variant: evaluation?.variant,
    config: evaluation?.config,
    experiment: evaluation?.experiment,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook to evaluate multiple feature flags at once
 * 
 * @param flagKeys - Array of feature flag keys
 * @param context - Optional context for evaluation
 * @returns Map of flag keys to evaluations
 */
export function useFeatureFlags(
  flagKeys: string[],
  context?: FeatureFlagContext
): {
  flags: Map<string, FeatureFlagEvaluation>;
  loading: boolean;
  error?: Error;
  refresh: () => void;
} {
  const { user, tenant } = useAuth();
  const { subscribe, unsubscribe } = useWebSocket();
  
  const [flags, setFlags] = useState<Map<string, FeatureFlagEvaluation>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  // Build evaluation context
  const evaluationContext = useMemo(() => ({
    userId: user?.id,
    tenantId: tenant?.id || context?.tenantId,
    tenantTier: tenant?.subscription_tier || context?.tenantTier,
    region: context?.region,
    ...context?.customAttributes,
  }), [user, tenant, context]);

  // Evaluate all flags
  const evaluateFlags = useCallback(async (force = false) => {
    try {
      // Check cache for all flags
      if (!force) {
        const cachedResults = new Map<string, FeatureFlagEvaluation>();
        const uncachedKeys: string[] = [];
        
        for (const key of flagKeys) {
          const cached = getCachedEvaluation(key);
          if (cached) {
            cachedResults.set(key, cached);
          } else {
            uncachedKeys.push(key);
          }
        }
        
        // If all are cached, return immediately
        if (uncachedKeys.length === 0) {
          setFlags(cachedResults);
          setLoading(false);
          return;
        }
        
        // Evaluate only uncached flags
        if (uncachedKeys.length < flagKeys.length) {
          setFlags(cachedResults); // Set partial results
        }
      }

      setLoading(true);
      setError(undefined);

      const response = await api.post('/api/feature-flags/evaluate', {
        flag_keys: force ? flagKeys : flagKeys.filter(key => !getCachedEvaluation(key)),
        context: evaluationContext,
      });

      const results = new Map<string, FeatureFlagEvaluation>();
      
      for (const key of flagKeys) {
        const evaluation = response.data[key] || { enabled: false };
        results.set(key, evaluation);
        setCachedEvaluation(key, evaluation);
      }

      setFlags(results);
      setLoading(false);
    } catch (err) {
      console.error('Error evaluating feature flags:', err);
      setError(err as Error);
      setLoading(false);
      
      // Set safe defaults
      const defaults = new Map<string, FeatureFlagEvaluation>();
      for (const key of flagKeys) {
        defaults.set(key, { enabled: false });
      }
      setFlags(defaults);
    }
  }, [flagKeys, evaluationContext]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (flagKeys.length === 0) return;

    const handleUpdate = (data: any) => {
      if (flagKeys.includes(data.flag_key)) {
        // Invalidate cache for updated flag
        flagCache.delete(data.flag_key);
        cacheTimestamps.delete(data.flag_key);
        
        // Re-evaluate all flags
        evaluateFlags(true);
      }
    };

    subscribe('feature_flag_update', handleUpdate);

    return () => {
      unsubscribe('feature_flag_update');
    };
  }, [flagKeys, subscribe, unsubscribe, evaluateFlags]);

  // Initial evaluation
  useEffect(() => {
    evaluateFlags();
  }, [evaluateFlags]);

  // Refresh function
  const refresh = useCallback(() => {
    evaluateFlags(true);
  }, [evaluateFlags]);

  return {
    flags,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook to get all feature flags for the current tenant
 * Useful for admin interfaces and debugging
 */
export function useTenantFeatureFlags(): {
  flags: Record<string, FeatureFlagEvaluation>;
  loading: boolean;
  error?: Error;
  refresh: () => void;
} {
  const { tenant } = useAuth();
  const [flags, setFlags] = useState<Record<string, FeatureFlagEvaluation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  const fetchFlags = useCallback(async () => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      const response = await api.get(`/api/feature-flags/tenant/${tenant.id}`);
      setFlags(response.data);
      
      // Cache all flags
      for (const [key, evaluation] of Object.entries(response.data)) {
        setCachedEvaluation(key, evaluation as FeatureFlagEvaluation);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tenant feature flags:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  return {
    flags,
    loading,
    error,
    refresh: fetchFlags,
  };
}

// Helper functions for cache management

function getCachedEvaluation(key: string): FeatureFlagEvaluation | null {
  const cached = flagCache.get(key);
  const timestamp = cacheTimestamps.get(key);
  
  if (cached && timestamp) {
    const age = Date.now() - timestamp;
    if (age < CACHE_TTL) {
      return cached;
    }
    
    // Cache expired, remove it
    flagCache.delete(key);
    cacheTimestamps.delete(key);
  }
  
  return null;
}

function setCachedEvaluation(key: string, evaluation: FeatureFlagEvaluation): void {
  flagCache.set(key, evaluation);
  cacheTimestamps.set(key, Date.now());
  
  // Limit cache size (simple LRU-like behavior)
  if (flagCache.size > 100) {
    const firstKey = flagCache.keys().next().value;
    if (firstKey) {
      flagCache.delete(firstKey);
      cacheTimestamps.delete(firstKey);
    }
  }
}

/**
 * Clear all cached feature flag evaluations
 * Useful when user logs out or tenant changes
 */
export function clearFeatureFlagCache(): void {
  flagCache.clear();
  cacheTimestamps.clear();
  pendingEvaluations.clear();
}

/**
 * Type-safe feature flag checker
 * Use this for compile-time flag key validation
 */
export type FeatureFlagKey = 
  // Premium features
  | 'premium.webrtc.multipresenter'
  | 'premium.breakout.rooms'
  | 'premium.analytics.advanced'
  | 'premium.branding.custom'
  | 'premium.storage.unlimited'
  | 'premium.support.priority'
  | 'premium.whitelabel'
  // Beta features
  | 'beta.captions.ai'
  | 'beta.overlays.lowerthirds'
  | 'beta.video.virtualbackground'
  | 'beta.translation.realtime'
  | 'beta.moderation.ai'
  | 'beta.streaming.redundancy'
  // Experimental features
  | 'experimental.vr.streaming'
  | 'experimental.blockchain.tickets'
  | 'experimental.metaverse';

/**
 * Type-safe hook wrapper
 */
export function useTypedFeatureFlag(
  flagKey: FeatureFlagKey,
  context?: FeatureFlagContext
) {
  return useFeatureFlag(flagKey, context);
}

/**
 * HOC to conditionally render components based on feature flags
 */
export function withFeatureFlag<P extends object>(
  flagKey: FeatureFlagKey,
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const { isEnabled, loading } = useFeatureFlag(flagKey);
    
    if (loading) {
      return null; // Or a loading spinner
    }
    
    if (isEnabled) {
      return <Component {...props} />;
    }
    
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
}

// Export a feature flag provider for app-wide flag management
export { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';