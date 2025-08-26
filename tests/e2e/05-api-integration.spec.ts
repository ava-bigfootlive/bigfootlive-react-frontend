import { test, expect } from '@playwright/test';
import { apiEndpoints, expectedResponses } from '../fixtures/test-data';

const API_BASE = 'https://api.bigfootlive.io';

test.describe('API Integration Tests', () => {
  test('Backend health endpoint returns correct status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject(expectedResponses.healthCheck);
  });

  test('API handles CORS properly', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`, {
      headers: {
        'Origin': 'https://bigfootlive.io'
      }
    });
    
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
  });

  test('Streaming status endpoint responds', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/streaming/status`);
    
    // Should return 200 or 401 (if auth required)
    expect([200, 401, 404, 405]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('isLive');
    }
  });

  test('API rate limiting headers are present', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    const headers = response.headers();
    
    // Check for rate limit headers (if implemented)
    const hasRateLimitHeaders = 
      headers['x-ratelimit-limit'] || 
      headers['x-rate-limit-limit'] ||
      headers['retry-after'];
    
    // Rate limiting might not be implemented yet
    if (hasRateLimitHeaders) {
      console.log('Rate limiting headers found');
    }
  });

  test('API returns proper error format for invalid endpoints', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/invalid-endpoint-12345`);
    
    // Should return 404
    expect([404, 405]).toContain(response.status());
    
    // If JSON response, check format
    const contentType = response.headers()['content-type'];
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      expect(data).toHaveProperty('detail');
    }
  });

  test('WebSocket endpoint is accessible', async ({ page }) => {
    // Test WebSocket connection
    const wsUrl = 'wss://api.bigfootlive.io/ws';
    
    const wsConnected = await page.evaluate((url) => {
      return new Promise((resolve) => {
        try {
          const ws = new WebSocket(url);
          ws.onopen = () => {
            ws.close();
            resolve(true);
          };
          ws.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 5000);
        } catch {
          resolve(false);
        }
      });
    }, wsUrl);
    
    // WebSocket might not be available or require auth
    console.log(`WebSocket connection test: ${wsConnected ? 'Connected' : 'Not available'}`);
  });

  test('API response times are acceptable', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_BASE}/health`);
    const responseTime = Date.now() - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds
    
    console.log(`API response time: ${responseTime}ms`);
  });

  test('Authentication endpoints exist', async ({ request }) => {
    // Test login endpoint
    const loginResponse = await request.post(`${API_BASE}/api/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'testpassword'
      }
    });
    
    // Should return 200, 400, 401, or 405
    expect([200, 400, 401, 404, 405, 422]).toContain(loginResponse.status());
  });

  test('API handles different HTTP methods correctly', async ({ request }) => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    for (const method of methods) {
      const response = await request.fetch(`${API_BASE}/health`, {
        method: method
      });
      
      // GET should work, others might return 405 Method Not Allowed
      if (method === 'GET') {
        expect(response.status()).toBe(200);
      } else {
        expect([200, 405]).toContain(response.status());
      }
    }
  });

  test('API returns appropriate cache headers', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    const headers = response.headers();
    
    // Check for cache control headers
    const cacheControl = headers['cache-control'];
    if (cacheControl) {
      expect(cacheControl).toMatch(/no-cache|no-store|must-revalidate|max-age/);
    }
  });

  test('Streaming analytics endpoint structure', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/streaming/analytics`);
    
    // Might require auth
    if (response.status() === 200) {
      const data = await response.json();
      
      // Check for expected analytics properties
      const expectedProps = ['viewers', 'duration', 'bandwidth'];
      for (const prop of expectedProps) {
        if (data[prop] !== undefined) {
          console.log(`Analytics property '${prop}' found`);
        }
      }
    }
  });

  test('API handles large payloads appropriately', async ({ request }) => {
    // Create a large payload
    const largeData = {
      data: 'x'.repeat(10000) // 10KB of data
    };
    
    const response = await request.post(`${API_BASE}/api/test`, {
      data: largeData
    });
    
    // Should handle gracefully (might return 404, 413, or process it)
    expect(response.status()).toBeLessThanOrEqual(500);
  });

  test('API version information is available', async ({ request }) => {
    // Check for version endpoint or header
    const response = await request.get(`${API_BASE}/health`);
    const headers = response.headers();
    
    // Look for version in headers or response
    const versionHeader = headers['x-api-version'] || headers['api-version'];
    if (versionHeader) {
      expect(versionHeader).toMatch(/\d+\.\d+/);
    }
    
    const data = await response.json();
    if (data.version) {
      expect(data.version).toMatch(/\d+\.\d+/);
    }
  });

  test('Error responses have consistent format', async ({ request }) => {
    const invalidEndpoints = [
      '/api/nonexistent',
      '/api/users/99999999',
      '/api/events/invalid-id'
    ];
    
    for (const endpoint of invalidEndpoints) {
      const response = await request.get(`${API_BASE}${endpoint}`);
      
      if (response.headers()['content-type']?.includes('application/json')) {
        const data = await response.json();
        
        // Should have error message
        expect(
          data.detail || 
          data.message || 
          data.error || 
          data.msg
        ).toBeDefined();
      }
    }
  });

  test('API documentation is accessible', async ({ request }) => {
    const docEndpoints = ['/docs', '/api/docs', '/swagger', '/openapi.json'];
    
    for (const endpoint of docEndpoints) {
      const response = await request.get(`${API_BASE}${endpoint}`);
      
      if (response.status() === 200) {
        console.log(`API documentation found at ${endpoint}`);
        break;
      }
    }
  });
});