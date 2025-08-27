import { useState, useCallback, useRef } from 'react';
import { errorHandler, AppError, ErrorType, ErrorSeverity } from '@/utils/errorHandler';
import { toast } from '@/components/ui/use-toast';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  context?: string;
}

interface UseErrorHandlerReturn {
  error: AppError | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: any, customContext?: string) => void;
  withErrorHandling: <T extends (...args: any[]) => any>(
    fn: T,
    customContext?: string
  ) => T;
  asyncWithErrorHandling: <T>(
    fn: () => Promise<T>,
    customContext?: string
  ) => Promise<T | undefined>;
}

export const useErrorHandler = (
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn => {
  const [error, setError] = useState<AppError | null>(null);
  const retryCallbacksRef = useRef<Map<string, () => Promise<any>>>(new Map());

  const handleError = useCallback(
    (err: any, customContext?: string) => {
      const context = customContext || options.context;
      
      // Parse and handle the error
      const appError = errorHandler.handle(err, context);
      setError(appError);

      // Store retry callback if error is retryable
      if (appError.retryable && appError.details?.retryId) {
        retryCallbacksRef.current.set(
          appError.details.retryId,
          () => Promise.resolve()
        );
      }

      return appError;
    },
    [options.context]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Wrapper for synchronous functions
  const withErrorHandling = useCallback(
    <T extends (...args: any[]) => any>(
      fn: T,
      customContext?: string
    ): T => {
      return ((...args: Parameters<T>) => {
        try {
          return fn(...args);
        } catch (error) {
          handleError(error, customContext);
          throw error; // Re-throw to maintain function signature
        }
      }) as T;
    },
    [handleError]
  );

  // Wrapper for async functions
  const asyncWithErrorHandling = useCallback(
    async <T>(
      fn: () => Promise<T>,
      customContext?: string
    ): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (error) {
        handleError(error, customContext);
        return undefined;
      }
    },
    [handleError]
  );

  return {
    error,
    isError: !!error,
    clearError,
    handleError,
    withErrorHandling,
    asyncWithErrorHandling
  };
};

// Hook for handling API calls with loading and error states
interface UseApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  context?: string;
}

interface UseApiCallReturn<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  execute: (...args: any[]) => Promise<T | undefined>;
  reset: () => void;
}

export const useApiCall = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions<T> = {}
): UseApiCallReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        if (options.showSuccessToast) {
          toast({
            title: 'Success',
            description: options.successMessage || 'Operation completed successfully',
            variant: 'default'
          });
        }

        return result;
      } catch (err: any) {
        const appError = errorHandler.handle(err, options.context);
        setError(appError);

        if (options.onError) {
          options.onError(appError);
        }

        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

// Hook for handling form submissions with error handling
interface UseFormSubmitOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  resetOnSuccess?: boolean;
  successMessage?: string;
  context?: string;
}

export const useFormSubmit = <T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: UseFormSubmitOptions<T> = {}
) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<AppError | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (data: any): Promise<T | undefined> => {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        const result = await submitFunction(data);
        setSubmitSuccess(true);

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        toast({
          title: 'Success',
          description: options.successMessage || 'Form submitted successfully',
          variant: 'default'
        });

        return result;
      } catch (err: any) {
        const appError = errorHandler.handle(err, options.context || 'Form Submission');
        setSubmitError(appError);

        if (options.onError) {
          options.onError(appError);
        }

        return undefined;
      } finally {
        setSubmitting(false);
      }
    },
    [submitFunction, options]
  );

  const resetSubmit = useCallback(() => {
    setSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  return {
    handleSubmit,
    submitting,
    submitError,
    submitSuccess,
    resetSubmit
  };
};

// Hook for handling retryable operations
interface UseRetryableOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number) => void;
  context?: string;
}

export const useRetryable = <T = any>(
  operation: () => Promise<T>,
  options: UseRetryableOptions = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.retryDelay || 1000;

  const executeWithRetry = useCallback(
    async (attempt: number = 0): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operation();
        setData(result);
        setRetryCount(0);
        return result;
      } catch (err: any) {
        const appError = errorHandler.handle(err, options.context);
        
        if (appError.retryable && attempt < maxRetries) {
          const delay = options.backoff 
            ? baseDelay * Math.pow(2, attempt) 
            : baseDelay;

          if (options.onRetry) {
            options.onRetry(attempt + 1);
          }

          toast({
            title: 'Retrying...',
            description: `Attempt ${attempt + 1} of ${maxRetries}`,
            variant: 'default'
          });

          setRetryCount(attempt + 1);

          await new Promise(resolve => setTimeout(resolve, delay));
          return executeWithRetry(attempt + 1);
        }

        setError(appError);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [operation, maxRetries, baseDelay, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setRetryCount(0);
  }, []);

  return {
    execute: executeWithRetry,
    loading,
    error,
    data,
    retryCount,
    reset
  };
};

export default useErrorHandler;