import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential for enterprise tests
  forbidOnly: true,
  retries: 1,
  workers: 2, // Limited workers for production stability
  reporter: [
    ['html', { outputFolder: 'playwright-report-prod', open: 'never' }],
    ['json', { outputFile: 'test-results-prod.json' }],
    ['junit', { outputFile: 'junit-prod.xml' }],
    ['list']
  ],
  
  use: {
    baseURL: 'https://d2dbuyze4zqbdy.cloudfront.net',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Production-specific settings
    ignoreHTTPSErrors: false,
    acceptDownloads: true,
    
    // Extended timeouts for production environment
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  // Test timeout for complex enterprise features
  timeout: 120000,
  expect: {
    timeout: 15000,
  },

  projects: [
    {
      name: 'chromium-prod',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    }
  ],
});