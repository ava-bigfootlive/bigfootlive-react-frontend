// API Health Check Service
// Tracks API availability to prevent unnecessary 405 requests

interface HealthStatus {
  available: boolean;
  lastCheck: number;
  endpoints: {
    [key: string]: {
      available: boolean;
      lastError?: number;
      errorCount: number;
    };
  };
}

class ApiHealthService {
  private status: HealthStatus = {
    available: true,
    lastCheck: 0,
    endpoints: {}
  };

  private readonly CHECK_INTERVAL = 60000; // 1 minute
  private readonly ENDPOINT_BLACKLIST_DURATION = 300000; // 5 minutes
  private readonly MAX_ERROR_COUNT = 3;

  constructor() {
    // Load saved status from localStorage
    const saved = localStorage.getItem('apiHealthStatus');
    if (saved) {
      try {
        this.status = JSON.parse(saved);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  // Check if an endpoint should be called
  shouldCallEndpoint(endpoint: string): boolean {
    // Clean up the endpoint path for consistent tracking
    const cleanEndpoint = this.getCleanEndpoint(endpoint);
    
    const endpointStatus = this.status.endpoints[cleanEndpoint];
    if (!endpointStatus) {
      return true; // Unknown endpoint, allow the call
    }

    // If endpoint has too many errors and was recently blacklisted, skip it
    if (endpointStatus.errorCount >= this.MAX_ERROR_COUNT) {
      const timeSinceError = Date.now() - (endpointStatus.lastError || 0);
      if (timeSinceError < this.ENDPOINT_BLACKLIST_DURATION) {
        return false; // Skip this endpoint
      } else {
        // Reset the endpoint status after blacklist period
        delete this.status.endpoints[cleanEndpoint];
        this.saveStatus();
        return true;
      }
    }

    return endpointStatus.available !== false;
  }

  // Record a successful API call
  recordSuccess(endpoint: string): void {
    const cleanEndpoint = this.getCleanEndpoint(endpoint);
    
    this.status.endpoints[cleanEndpoint] = {
      available: true,
      errorCount: 0
    };
    
    this.status.available = true;
    this.status.lastCheck = Date.now();
    this.saveStatus();
  }

  // Record a failed API call
  recordError(endpoint: string, statusCode: number): void {
    const cleanEndpoint = this.getCleanEndpoint(endpoint);
    
    // Only track 405 (Method Not Allowed) and 404 (Not Found) as availability issues
    if (statusCode === 405 || statusCode === 404) {
      const current = this.status.endpoints[cleanEndpoint] || {
        available: true,
        errorCount: 0
      };

      this.status.endpoints[cleanEndpoint] = {
        available: false,
        lastError: Date.now(),
        errorCount: current.errorCount + 1
      };

      this.saveStatus();
    }
  }

  // Get clean endpoint path for tracking
  private getCleanEndpoint(endpoint: string): string {
    // Remove query parameters and trailing slashes
    let clean = endpoint.split('?')[0].replace(/\/$/, '');
    
    // Group similar endpoints
    // e.g., /events/123 -> /events/:id
    clean = clean.replace(/\/[\w-]{20,}/, '/:id');
    clean = clean.replace(/\/\d+/, '/:id');
    
    return clean;
  }

  // Save status to localStorage
  private saveStatus(): void {
    try {
      localStorage.setItem('apiHealthStatus', JSON.stringify(this.status));
    } catch (e) {
      // Ignore storage errors
    }
  }

  // Reset health status (useful for testing)
  reset(): void {
    this.status = {
      available: true,
      lastCheck: 0,
      endpoints: {}
    };
    localStorage.removeItem('apiHealthStatus');
  }

  // Get current status (for debugging)
  getStatus(): HealthStatus {
    return { ...this.status };
  }
}

// Export singleton instance
export const apiHealth = new ApiHealthService();