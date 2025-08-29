import { fetchAuthSession } from 'aws-amplify/auth';
import { errorHandler, AppError, ErrorType, ErrorSeverity } from '@/utils/errorHandler';
import { toast } from '@/components/ui/use-toast';
import { apiHealth } from './apiHealth';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.bigfootlive.io';

interface RequestOptions extends RequestInit {
  authenticated?: boolean;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  skipErrorHandler?: boolean;
}

interface RetryConfig {
  retries: number;
  delay: number;
  attempt: number;
}


class ApiClient {
  private async getHeaders(authenticated: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authenticated) {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to get auth token:', err);
      }
    }

    return headers;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      authenticated = true,
      retries = 3,
      retryDelay = 1000,
      timeout = 30000,
      skipErrorHandler = false,
      ...fetchOptions
    } = options;

    const retryConfig: RetryConfig = {
      retries,
      delay: retryDelay,
      attempt: 0
    };

    return this.requestWithRetry<T>(
      endpoint,
      fetchOptions,
      authenticated,
      timeout,
      skipErrorHandler,
      retryConfig
    );
  }

  private async requestWithRetry<T>(
    endpoint: string,
    fetchOptions: RequestInit,
    authenticated: boolean,
    timeout: number,
    skipErrorHandler: boolean,
    retryConfig: RetryConfig
  ): Promise<T> {
    // Check if this endpoint should be skipped
    if (!apiHealth.shouldCallEndpoint(endpoint)) {
      // Return empty response immediately without making the request
      return this.getEmptyResponse(endpoint, fetchOptions.method || 'GET') as T;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers = await this.getHeaders(authenticated);
      
      let response: Response;
      try {
        response = await fetch(`${API_URL}${endpoint}`, {
          ...fetchOptions,
          headers: {
            ...headers,
            ...fetchOptions.headers,
          },
          signal: controller.signal
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

      clearTimeout(timeoutId);

      // Handle specific status codes
      if (!response.ok) {
        // For 404/405/401 errors on certain endpoints, return empty data instead of throwing
        // These are expected when backend endpoints don't exist yet or auth is missing
        if (response.status === 404 || response.status === 405 || 
            (response.status === 401 && (endpoint.includes('/events') || 
                                         endpoint.includes('/media') || 
                                         endpoint.includes('/playlist')))) {
          // Record this error to prevent future attempts
          apiHealth.recordError(endpoint, response.status);
          // Don't log to console, just return empty response
          return this.getEmptyResponse(endpoint, fetchOptions.method || 'GET') as T;
        }

        const errorData = await response.json().catch(() => ({
          message: 'Request failed',
          details: null
        }));

        let errorType: ErrorType;
        let severity: ErrorSeverity;
        let retryable = false;

        switch (response.status) {
          case 401:
            errorType = ErrorType.AUTH;
            severity = ErrorSeverity.ERROR;
            // Only redirect to login for certain endpoints
            // Don't redirect for endpoints that might just be missing or have auth issues
            if (!endpoint.includes('/media') && 
                !endpoint.includes('/playlist') && 
                !endpoint.includes('/assets') && 
                !endpoint.includes('/events')) {
              this.handleAuthError();
            }
            break;
          case 403:
            errorType = ErrorType.PERMISSION;
            severity = ErrorSeverity.WARNING;
            break;
          case 404:
            errorType = ErrorType.NOT_FOUND;
            severity = ErrorSeverity.WARNING;
            break;
          case 422:
            errorType = ErrorType.VALIDATION;
            severity = ErrorSeverity.WARNING;
            break;
          case 429:
            errorType = ErrorType.RATE_LIMIT;
            severity = ErrorSeverity.WARNING;
            retryable = true;
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorType = ErrorType.SERVER;
            severity = ErrorSeverity.ERROR;
            retryable = true;
            break;
          default:
            errorType = ErrorType.API;
            severity = ErrorSeverity.ERROR;
        }

        const appError = new AppError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorType,
          severity,
          response.status,
          errorData.details || errorData,
          retryable
        );

        // Check if we should retry
        if (retryable && retryConfig.attempt < retryConfig.retries) {
          retryConfig.attempt++;
          const delay = retryConfig.delay * Math.pow(2, retryConfig.attempt - 1);
          
          // Don't show retry toasts - too noisy
          // if (!skipErrorHandler) {
          //   toast({
          //     title: 'Retrying...',
          //     description: `Attempt ${retryConfig.attempt} of ${retryConfig.retries}`,
          //     variant: 'default'
          //   });
          // }

          await new Promise(resolve => setTimeout(resolve, delay));
          return this.requestWithRetry<T>(
            endpoint,
            fetchOptions,
            authenticated,
            timeout,
            skipErrorHandler,
            retryConfig
          );
        }

        // Handle error if not retrying
        if (!skipErrorHandler) {
          // Only show error for non-404/405 errors to reduce noise
          if (response.status !== 404 && response.status !== 405) {
            errorHandler.handle(appError, `API Request: ${endpoint}`);
          }
        }
        
        throw appError;
      }

      // Handle successful response
      apiHealth.recordSuccess(endpoint);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        // For non-JSON responses, return the response itself
        return response as unknown as T;
      }

    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle abort/timeout
      if (error.name === 'AbortError') {
        const timeoutError = new AppError(
          'Request timeout',
          ErrorType.NETWORK,
          ErrorSeverity.ERROR,
          undefined,
          { endpoint, timeout },
          true
        );

        if (!skipErrorHandler) {
          errorHandler.handle(timeoutError, `API Timeout: ${endpoint}`);
        }
        throw timeoutError;
      }

      // Handle network errors
      if (!navigator.onLine) {
        const networkError = new AppError(
          'No internet connection',
          ErrorType.NETWORK,
          ErrorSeverity.ERROR,
          undefined,
          { endpoint },
          true
        );

        if (!skipErrorHandler) {
          errorHandler.handle(networkError, 'Network Error');
        }
        throw networkError;
      }

      // If it's already an AppError, just re-throw
      if (error instanceof AppError) {
        throw error;
      }

      // Handle other errors
      const genericError = new AppError(
        error.message || 'Request failed',
        ErrorType.UNKNOWN,
        ErrorSeverity.ERROR,
        undefined,
        { endpoint, originalError: error },
        false
      );

      if (!skipErrorHandler) {
        errorHandler.handle(genericError, `API Error: ${endpoint}`);
      }
      throw genericError;
    }
  }

  private handleAuthError() {
    // Clear local storage
    localStorage.removeItem('authToken');
    
    // Redirect to login after a short delay
    setTimeout(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }, 1500);
  }

  // Return empty response for expected failures
  private getEmptyResponse(endpoint: string, method: string): any {
    // Events endpoints
    if (endpoint.includes('/events')) {
      if (endpoint.match(/\/events\/[^/]+$/)) {
        return null;
      }
      // Return the expected structure for listEvents
      return { items: [], total: 0 };
    }
    
    // Users endpoints
    if (endpoint.includes('/users')) {
      if (endpoint.includes('/me')) {
        return null;
      }
      if (endpoint.match(/\/users\/[^/]+$/)) {
        return null;
      }
      return [];
    }
    
    // Tenants endpoints
    if (endpoint.includes('/tenants')) {
      if (endpoint.match(/\/tenants\/[^/]+$/)) {
        return null;
      }
      return [];
    }
    
    // Media/VOD endpoints
    if (endpoint.includes('/media')) {
      if (endpoint.includes('/upload/presigned-url')) {
        return null;
      }
      if (endpoint.includes('/upload/complete')) {
        return null;
      }
      if (endpoint.includes('/user/media')) {
        return {
          items: [],
          total: 0,
          page: 1,
          pages: 0
        };
      }
      if (endpoint.match(/\/media\/[^/]+$/)) {
        return null;
      }
      return [];
    }
    
    // Chat endpoints
    if (endpoint.includes('/chat')) {
      if (endpoint.includes('/history')) {
        return [];
      }
      if (endpoint.includes('/send')) {
        return { success: false };
      }
      return [];
    }
    
    // Analytics endpoints
    if (endpoint.includes('/analytics')) {
      if (endpoint.includes('/viewers')) {
        return { count: 0, trend: 'stable' };
      }
      return {
        viewers: { current: 0, peak: 0, average: 0, total: 0 },
        engagement: { chatMessages: 0, reactions: 0, avgWatchTime: 0 },
        quality: { avgBitrate: 0, bufferRatio: 0, streamHealth: 0 }
      };
    }
    
    // Container endpoints
    if (endpoint.includes('/containers')) {
      if (endpoint.includes('/status')) {
        return {
          status: 'stopped',
          health: 'unknown',
          services: {
            rtmp: false,
            transcoding: false,
            hls: false,
            analytics: false
          }
        };
      }
      if (endpoint.includes('/launch')) {
        return { success: false };
      }
      if (endpoint.includes('/stop')) {
        return { success: false };
      }
    }
    
    // Stream endpoints
    if (endpoint.includes('/streams')) {
      if (endpoint.includes('/start')) {
        return { success: false };
      }
      if (endpoint.includes('/stop')) {
        return { success: false };
      }
      return [];
    }
    
    // Feature flags
    if (endpoint.includes('/feature-flags')) {
      if (endpoint.match(/\/feature-flags\/[^/]+$/)) {
        return null;
      }
      return [];
    }
    
    // Health check
    if (endpoint.includes('/health')) {
      return { status: 'unknown', timestamp: new Date().toISOString() };
    }
    
    // Auth endpoints
    if (endpoint.includes('/auth/validate')) {
      return { valid: false };
    }
    
    // Default empty response for unknown endpoints
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      return { success: false };
    }
    if (method === 'DELETE') {
      return { success: false };
    }
    
    return [];
  }

  // Auth endpoints
  async validateToken(): Promise<any> {
    return this.request('/api/v1/auth/validate');
  }

  // User endpoints
  async getCurrentUser(): Promise<any> {
    return this.request('/api/v1/users/me');
  }

  async updateProfile(data: any): Promise<any> {
    return this.request('/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Tenant endpoints
  async getTenants(): Promise<any> {
    return this.request('/api/v1/tenants/');
  }

  async getTenant(id: string): Promise<any> {
    return this.request(`/api/v1/tenants/${id}`);
  }

  async createTenant(data: any): Promise<any> {
    return this.request('/api/v1/tenants/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTenant(id: string, data: any): Promise<any> {
    return this.request(`/api/v1/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTenant(id: string): Promise<any> {
    return this.request(`/api/v1/tenants/${id}`, {
      method: 'DELETE',
    });
  }

  // User management endpoints
  async getUsers(): Promise<any> {
    return this.request('/api/v1/users/');
  }

  async getUser(id: string): Promise<any> {
    return this.request(`/api/v1/users/${id}`);
  }

  async createUser(data: any): Promise<any> {
    return this.request('/api/v1/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any): Promise<any> {
    return this.request(`/api/v1/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<any> {
    return this.request(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Feature flags endpoints
  async getFeatureFlags(): Promise<any> {
    return this.request('/api/v1/feature-flags/');
  }

  async getFeatureFlag(id: string): Promise<any> {
    return this.request(`/api/v1/feature-flags/${id}`);
  }

  async createFeatureFlag(data: any): Promise<any> {
    return this.request('/api/v1/feature-flags/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFeatureFlag(id: string, data: any): Promise<any> {
    return this.request(`/api/v1/feature-flags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFeatureFlag(id: string): Promise<any> {
    return this.request(`/api/v1/feature-flags/${id}`, {
      method: 'DELETE',
    });
  }

  // Event endpoints
  async getEvents(): Promise<any> {
    return this.request('/api/v1/events/', {
      method: 'GET'
    });
  }

  async getEvent(id: string): Promise<any> {
    return this.request(`/api/v1/events/${id}`);
  }

  async createEvent(data: any): Promise<any> {
    return this.request('/api/v1/events/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: any): Promise<any> {
    return this.request(`/api/v1/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string): Promise<any> {
    return this.request(`/api/v1/events/${id}`, {
      method: 'DELETE',
    });
  }


  // Stream endpoints
  async getStreams(): Promise<any> {
    return this.request('/api/v1/streams/');
  }

  async getStream(id: string): Promise<any> {
    return this.request(`/api/v1/streams/${id}`);
  }

  async startStream(eventId: string): Promise<any> {
    return this.request(`/api/v1/streams/${eventId}/start`, {
      method: 'POST',
    });
  }

  async stopStream(eventId: string): Promise<any> {
    return this.request(`/api/v1/streams/${eventId}/stop`, {
      method: 'POST',
    });
  }

  // Container endpoints
  async launchContainer(eventId: string): Promise<any> {
    return this.request(`/api/v1/containers/${eventId}/launch`, {
      method: 'POST',
    });
  }

  async stopContainer(eventId: string): Promise<any> {
    return this.request(`/api/v1/containers/${eventId}/stop`, {
      method: 'POST',
    });
  }

  async getContainerStatus(eventId: string): Promise<any> {
    return this.request(`/api/v1/containers/${eventId}/status`);
  }

  // Analytics endpoints
  async getAnalytics(eventId: string): Promise<any> {
    return this.request(`/api/v1/analytics/${eventId}`);
  }

  async getViewerMetrics(eventId: string): Promise<any> {
    return this.request(`/api/v1/analytics/${eventId}/viewers`);
  }

  // Chat endpoints - Note: These endpoints may not exist yet in backend
  async getChatHistory(eventId: string): Promise<any> {
    return this.request(`/api/v1/chat/${eventId}/history`);
  }

  async sendChatMessage(eventId: string, message: string): Promise<any> {
    return this.request(`/api/v1/chat/${eventId}/send`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Media/VOD endpoints
  async getUploadUrl(filename: string, contentType: string = 'video/mp4'): Promise<any> {
    return this.request('/api/v1/media/upload/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ filename, content_type: contentType }),
    });
  }

  async completeUpload(objectKey: string, filename: string, fileSize?: number): Promise<any> {
    const body: any = { 
      object_key: objectKey, 
      filename
    };
    if (fileSize !== undefined) {
      body.file_size = fileSize;
    }
    return this.request('/api/v1/media/upload/complete', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getProcessingStatus(jobId: string): Promise<any> {
    return this.request(`/api/v1/media/processing/status/${jobId}`);
  }

  async getUserMedia(page: number = 1, limit: number = 20): Promise<any> {
    // Try the endpoint, but return empty data if it fails
    return this.request(`/api/v1/media/user/media?page=${page}&limit=${limit}`, {
      skipErrorHandler: false
    }).catch(() => ({ items: [], total: 0 }));
  }

  async getMedia(mediaId: string): Promise<any> {
    return this.request(`/api/v1/media/${mediaId}`);
  }

  async deleteMedia(mediaId: string): Promise<any> {
    return this.request(`/api/v1/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/health', { authenticated: false });
  }

  // Generic HTTP methods
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;