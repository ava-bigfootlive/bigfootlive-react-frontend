import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.bigfootlive.io';

interface RequestOptions extends RequestInit {
  authenticated?: boolean;
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

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { authenticated = true, ...fetchOptions } = options;
    const headers = await this.getHeaders(authenticated);

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
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
    return this.request('/api/v1/tenants');
  }

  async getTenant(id: string): Promise<any> {
    return this.request(`/api/v1/tenants/${id}`);
  }

  async createTenant(data: any): Promise<any> {
    return this.request('/api/v1/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Event endpoints
  async getEvents(): Promise<any> {
    return this.request('/api/v1/events');
  }

  async getEvent(id: string): Promise<any> {
    return this.request(`/api/v1/events/${id}`);
  }

  async createEvent(data: any): Promise<any> {
    return this.request('/api/v1/events', {
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
    return this.request('/api/v1/streams');
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

  // Chat endpoints
  async getChatHistory(eventId: string): Promise<any> {
    return this.request(`/api/v1/chat/${eventId}/history`);
  }

  async sendChatMessage(eventId: string, message: string): Promise<any> {
    return this.request(`/api/v1/chat/${eventId}/send`, {
      method: 'POST',
      body: JSON.stringify({ message }),
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