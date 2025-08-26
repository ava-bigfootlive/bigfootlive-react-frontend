import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  const API_URL = process.env.PLAYWRIGHT_API_URL || 'https://api.bigfootlive.io';

  test('health endpoint should be accessible', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('should handle CORS correctly', async ({ request }) => {
    const response = await request.fetch(`${API_URL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://bigfootlive.io',
        'Access-Control-Request-Method': 'GET',
      },
    });

    expect(response.ok()).toBeTruthy();
    
    const corsHeader = response.headers()['access-control-allow-origin'];
    expect(corsHeader).toBeTruthy();
  });

  test('should require authentication for protected endpoints', async ({ request }) => {
    const response = await request.get(`${API_URL}/test/protected`);
    expect(response.status()).toBe(401);
  });

  test('should validate request payloads', async ({ request }) => {
    const response = await request.post(`${API_URL}/test/validate`, {
      data: {
        // Invalid data - negative value
        name: 'test',
        value: -1
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post(`${API_URL}/test/validate`, {
      data: '{invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should return proper content types', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('should handle large payloads appropriately', async ({ request }) => {
    const largeData = { data: 'x'.repeat(15000) }; // >10KB payload
    
    const response = await request.post(`${API_URL}/test/large-payload`, {
      data: largeData,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should reject large payload
    expect(response.status()).toBe(413);
  });

  test('should handle rate limiting gracefully', async ({ request }) => {
    const promises = [];
    
    // Send multiple requests rapidly
    for (let i = 0; i < 20; i++) {
      promises.push(request.get(`${API_URL}/health`));
    }
    
    const responses = await Promise.all(promises);
    
    // At least some requests should succeed
    const successfulRequests = responses.filter(r => r.ok()).length;
    expect(successfulRequests).toBeGreaterThan(0);
    
    // Check if rate limiting is applied
    const rateLimitedRequests = responses.filter(r => r.status() === 429).length;
    console.log(`Rate limited requests: ${rateLimitedRequests}`);
  });
});