import { defineConfig, devices } from '@playwright/test';

// Load environment variables from .env files
// dotenv is not needed as vite handles env vars

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never'
    }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://d2dbuyze4zqbdy.cloudfront.net',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global timeout for all actions - increased for SSR */
    actionTimeout: 45000,
    
    /* Navigation timeout - increased for SSR initial loads */
    navigationTimeout: 90000,
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
    
    /* Accept downloads */
    acceptDownloads: true,
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  /* Timeout for each test */
  timeout: 120000,
  
  /* Expect timeout for assertions */
  expect: {
    timeout: 15000,
    toMatchSnapshot: {
      threshold: 0.3,
      mode: 'percent'
    }
  },

  /* Global setup and teardown */
  // globalSetup: './tests/setup/global-setup.ts',
  // globalTeardown: './tests/setup/global-teardown.ts',

  /* Configure projects for major browsers */
  projects: [
    // Production regression tests
    {
      name: 'production-regression',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        permissions: ['clipboard-read', 'clipboard-write'],
      },
      testMatch: '**/production-regression.spec.ts',
    },
    // VOD upload tests
    {
      name: 'vod-upload',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: '**/vod-upload.spec.ts',
    },
    // Live streaming tests
    {
      name: 'live-streaming',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        permissions: ['clipboard-read', 'clipboard-write'],
      },
      testMatch: '**/live-streaming.spec.ts',
    },
    // Mobile tests
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 12'],
      },
      testMatch: '**/production-regression.spec.ts',
    },
  ],

  /* Folder for test artifacts */
  outputDir: 'test-results/',
  
  /* Web server configuration for local development */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});