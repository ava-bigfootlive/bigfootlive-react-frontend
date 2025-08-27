import { toast } from '@/components/ui/use-toast';

// Error types
export const ErrorType = {
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  API: 'API',
  PERMISSION: 'PERMISSION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  RATE_LIMIT: 'RATE_LIMIT',
  WEBSOCKET: 'WEBSOCKET',
  FILE_UPLOAD: 'FILE_UPLOAD',
  UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

// Error severity levels
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

// Custom error class
export class AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  statusCode?: number;
  details?: any;
  retryable: boolean;
  userMessage: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    statusCode?: number,
    details?: any,
    retryable: boolean = false
  ) {
    super(message);
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.details = details;
    this.retryable = retryable;
    this.userMessage = this.getUserFriendlyMessage();
    Object.setPrototypeOf(this, AppError.prototype);
  }

  private getUserFriendlyMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return 'Connection error. Please check your internet connection.';
      case ErrorType.AUTH:
        if (this.statusCode === 401) {
          return 'Your session has expired. Please sign in again.';
        }
        return 'Authentication failed. Please check your credentials.';
      case ErrorType.PERMISSION:
        return 'You do not have permission to perform this action.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorType.SERVER:
        return 'Server error occurred. Please try again later.';
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorType.WEBSOCKET:
        // Less alarming message for WebSocket errors
        return 'Real-time features may be limited.';
      case ErrorType.FILE_UPLOAD:
        return 'File upload failed. Please check the file and try again.';
      case ErrorType.VALIDATION:
        return this.message || 'Please check your input and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

// Error handler configuration
interface ErrorHandlerConfig {
  logToConsole: boolean;
  logToService: boolean;
  showToast: boolean;
  serviceUrl?: string;
}

class GlobalErrorHandler {
  private config: ErrorHandlerConfig = {
    logToConsole: true,
    logToService: false,
    showToast: true
  };

  private retryCallbacks: Map<string, () => Promise<any>> = new Map();
  private errorLog: AppError[] = [];
  private maxLogSize = 100;
  private errorRateLimit: Map<string, number> = new Map(); // Track errors by type
  private errorRateLimitWindow = 5000; // 5 seconds
  private maxErrorsPerType = 1; // Max 1 error of same type per window
  private suppressedErrorTypes = new Set<ErrorType>(); // Types to suppress

  constructor(config?: Partial<ErrorHandlerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // By default, suppress WebSocket errors after initial notification
    this.suppressedErrorTypes.add(ErrorType.WEBSOCKET);
  }

  // Parse error from various sources
  parseError(error: any): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Network errors
    if (error.name === 'NetworkError' || error.message === 'Network request failed') {
      return new AppError(
        error.message,
        ErrorType.NETWORK,
        ErrorSeverity.ERROR,
        undefined,
        error,
        true
      );
    }

    // Fetch/API errors with response
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          return new AppError(
            data?.message || 'Unauthorized',
            ErrorType.AUTH,
            ErrorSeverity.ERROR,
            status,
            data,
            false
          );
        case 403:
          return new AppError(
            data?.message || 'Forbidden',
            ErrorType.PERMISSION,
            ErrorSeverity.WARNING,
            status,
            data,
            false
          );
        case 404:
          return new AppError(
            data?.message || 'Not found',
            ErrorType.NOT_FOUND,
            ErrorSeverity.WARNING,
            status,
            data,
            false
          );
        case 422:
          return new AppError(
            data?.message || 'Validation error',
            ErrorType.VALIDATION,
            ErrorSeverity.WARNING,
            status,
            data,
            false
          );
        case 429:
          return new AppError(
            data?.message || 'Too many requests',
            ErrorType.RATE_LIMIT,
            ErrorSeverity.WARNING,
            status,
            data,
            true
          );
        default:
          if (status >= 500) {
            return new AppError(
              data?.message || 'Server error',
              ErrorType.SERVER,
              ErrorSeverity.ERROR,
              status,
              data,
              true
            );
          }
          return new AppError(
            data?.message || error.message,
            ErrorType.API,
            ErrorSeverity.ERROR,
            status,
            data,
            false
          );
      }
    }

    // WebSocket errors
    if (error.type === 'websocket' || error.constructor?.name === 'WebSocket') {
      return new AppError(
        error.message || 'WebSocket error',
        ErrorType.WEBSOCKET,
        ErrorSeverity.WARNING,
        undefined,
        error,
        true
      );
    }

    // File upload errors
    if (error.type === 'file' || error.message?.includes('upload')) {
      return new AppError(
        error.message || 'File upload error',
        ErrorType.FILE_UPLOAD,
        ErrorSeverity.ERROR,
        undefined,
        error,
        true
      );
    }

    // Generic errors
    return new AppError(
      error.message || 'Unknown error',
      ErrorType.UNKNOWN,
      ErrorSeverity.ERROR,
      undefined,
      error,
      false
    );
  }

  // Main error handler
  handle(
    error: any,
    context?: string,
    retryCallback?: () => Promise<any>
  ): AppError {
    const appError = this.parseError(error);
    
    // Suppress 404/405 errors - these are expected when backend is down
    if (appError.statusCode === 404 || appError.statusCode === 405) {
      console.log('Expected error (404/405):', appError.message);
      return appError;
    }

    // Add context if provided
    if (context) {
      appError.message = `${context}: ${appError.message}`;
    }
    
    // Check if this error type should be rate limited
    if (this.shouldRateLimitError(appError)) {
      console.log(`Rate limiting ${appError.type} error`);
      // Still log to console but skip toast
      if (this.config.logToConsole) {
        this.logToConsole(appError);
      }
      this.addToErrorLog(appError);
      return appError;
    }

    // Store retry callback if provided and error is retryable
    if (retryCallback && appError.retryable) {
      const retryId = `${Date.now()}-${Math.random()}`;
      this.retryCallbacks.set(retryId, retryCallback);
      appError.details = { ...appError.details, retryId };
    }

    // Log to console
    if (this.config.logToConsole) {
      this.logToConsole(appError);
    }

    // Log to service
    if (this.config.logToService && this.config.serviceUrl) {
      this.logToService(appError);
    }

    // Show toast notification only for actual problems
    if (this.config.showToast && appError.severity !== ErrorSeverity.INFO) {
      // Don't show toasts for WebSocket, 404, or 405 errors
      if (appError.type !== ErrorType.WEBSOCKET && 
          appError.statusCode !== 404 && 
          appError.statusCode !== 405) {
        this.showToast(appError);
      }
    }

    // Store in error log
    this.addToErrorLog(appError);

    // Handle specific error types
    this.handleSpecificError(appError);

    return appError;
  }

  // Log to console with appropriate level
  private logToConsole(error: AppError) {
    const logData = {
      type: error.type,
      severity: error.severity,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: new Date().toISOString()
    };

    switch (error.severity) {
      case ErrorSeverity.INFO:
        console.info('Error:', logData);
        break;
      case ErrorSeverity.WARNING:
        console.warn('Error:', logData);
        break;
      case ErrorSeverity.CRITICAL:
        console.error('CRITICAL ERROR:', logData);
        break;
      default:
        console.error('Error:', logData);
    }
  }

  // Log to external service
  private async logToService(error: AppError) {
    if (!this.config.serviceUrl) return;

    try {
      await fetch(this.config.serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: error.type,
          severity: error.severity,
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      });
    } catch (logError) {
      console.error('Failed to log error to service:', logError);
    }
  }

  // Check if error should be rate limited
  private shouldRateLimitError(error: AppError): boolean {
    // Always rate limit WebSocket errors after first one
    if (error.type === ErrorType.WEBSOCKET) {
      const key = `${error.type}-${error.statusCode || 'generic'}`;
      const lastError = this.errorRateLimit.get(key);
      const now = Date.now();
      
      if (lastError && (now - lastError) < this.errorRateLimitWindow) {
        return true; // Rate limit this error
      }
      
      this.errorRateLimit.set(key, now);
      
      // Clean up old entries
      setTimeout(() => {
        this.errorRateLimit.delete(key);
      }, this.errorRateLimitWindow);
    }
    
    // Rate limit other repetitive errors
    if (error.type === ErrorType.NETWORK || error.type === ErrorType.API) {
      const key = `${error.type}-${error.message}`;
      const lastError = this.errorRateLimit.get(key);
      const now = Date.now();
      
      if (lastError && (now - lastError) < this.errorRateLimitWindow * 2) { // Longer window for these
        return true;
      }
      
      this.errorRateLimit.set(key, now);
      
      // Clean up old entries
      setTimeout(() => {
        this.errorRateLimit.delete(key);
      }, this.errorRateLimitWindow * 2);
    }
    
    return false;
  }
  
  // Show toast notification
  private showToast(error: AppError) {
    // Skip toast for suppressed error types
    if (this.suppressedErrorTypes.has(error.type) && error.severity !== ErrorSeverity.CRITICAL) {
      console.log(`Suppressing toast for ${error.type} error`);
      return;
    }
    
    const toastConfig: any = {
      title: this.getToastTitle(error),
      description: error.userMessage,
      variant: this.getToastVariant(error)
    };

    // Add retry action if available
    if (error.retryable && error.details?.retryId) {
      toastConfig.action = {
        label: 'Retry',
        onClick: () => this.retry(error.details.retryId)
      };
    }

    toast(toastConfig);
  }

  private getToastTitle(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.AUTH:
        return 'Authentication Error';
      case ErrorType.PERMISSION:
        return 'Access Denied';
      case ErrorType.NOT_FOUND:
        return 'Not Found';
      case ErrorType.SERVER:
        return 'Server Error';
      case ErrorType.RATE_LIMIT:
        return 'Rate Limited';
      case ErrorType.WEBSOCKET:
        return 'Connection Lost';
      case ErrorType.FILE_UPLOAD:
        return 'Upload Failed';
      case ErrorType.VALIDATION:
        return 'Validation Error';
      default:
        return 'Error';
    }
  }

  private getToastVariant(error: AppError): 'default' | 'destructive' {
    switch (error.severity) {
      case ErrorSeverity.INFO:
      case ErrorSeverity.WARNING:
        return 'default';
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      default:
        return 'destructive';
    }
  }

  // Handle specific error types with custom logic
  private handleSpecificError(error: AppError) {
    switch (error.type) {
      case ErrorType.AUTH:
        if (error.statusCode === 401) {
          // Redirect to login after a delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
        break;
      case ErrorType.PERMISSION:
        if (error.statusCode === 403) {
          // Redirect to unauthorized page
          setTimeout(() => {
            window.location.href = '/unauthorized';
          }, 1500);
        }
        break;
      case ErrorType.NETWORK:
        // Could trigger offline mode or queue actions
        this.handleNetworkError();
        break;
      case ErrorType.RATE_LIMIT:
        // Could implement backoff strategy
        this.handleRateLimitError(error);
        break;
    }
  }

  private handleNetworkError() {
    // Check if actually offline
    if (!navigator.onLine) {
      toast({
        title: 'You are offline',
        description: 'Some features may be limited',
        variant: 'default'
      });
    }
  }

  private handleRateLimitError(error: AppError) {
    const retryAfter = error.details?.retryAfter || 60;
    toast({
      title: 'Rate Limited',
      description: `Please wait ${retryAfter} seconds before trying again`,
      variant: 'default'
    });
  }

  // Retry failed operation
  async retry(retryId: string): Promise<any> {
    const callback = this.retryCallbacks.get(retryId);
    if (!callback) {
      console.warn('No retry callback found for:', retryId);
      return;
    }

    try {
      const result = await callback();
      this.retryCallbacks.delete(retryId);
      toast({
        title: 'Success',
        description: 'Operation completed successfully',
        variant: 'default'
      });
      return result;
    } catch (error) {
      // Handle the retry error
      this.handle(error, 'Retry failed');
    }
  }

  // Add to error log
  private addToErrorLog(error: AppError) {
    this.errorLog.push(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
  }

  // Get error log
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = [];
  }

  // Update configuration
  updateConfig(config: Partial<ErrorHandlerConfig>) {
    this.config = { ...this.config, ...config };
  }
  
  // Add or remove error types from suppression list
  setSuppressedErrorTypes(types: ErrorType[]) {
    this.suppressedErrorTypes = new Set(types);
  }
  
  // Add a single error type to suppression list
  suppressErrorType(type: ErrorType) {
    this.suppressedErrorTypes.add(type);
  }
  
  // Remove a single error type from suppression list
  unsuppressErrorType(type: ErrorType) {
    this.suppressedErrorTypes.delete(type);
  }
}

// Create singleton instance
export const errorHandler = new GlobalErrorHandler({
  logToConsole: import.meta.env.DEV,
  logToService: import.meta.env.PROD,
  showToast: true,
  serviceUrl: import.meta.env.VITE_ERROR_LOG_URL
});

// Convenience functions
export const handleError = (
  error: any,
  context?: string,
  retryCallback?: () => Promise<any>
) => errorHandler.handle(error, context, retryCallback);

export const logError = (error: any, context?: string) => {
  const config = errorHandler['config'];
  errorHandler.updateConfig({ showToast: false });
  const appError = errorHandler.handle(error, context);
  errorHandler.updateConfig(config);
  return appError;
};