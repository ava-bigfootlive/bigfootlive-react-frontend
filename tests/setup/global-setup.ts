import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Create browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Health check for all services
    console.log('🏥 Performing health checks...');
    
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'https://bigfootlive.io';
    const apiURL = process.env.PLAYWRIGHT_API_URL || 'https://api.bigfootlive.io';
    
    // Check frontend
    const frontendResponse = await page.goto(baseURL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    if (!frontendResponse?.ok()) {
      console.warn(`⚠️ Frontend health check failed: ${frontendResponse?.status()}`);
    }
    
    // Check backend API
    try {
      const backendResponse = await page.request.get(`${apiURL}/health`);
      if (!backendResponse.ok()) {
        console.warn(`⚠️ Backend health check failed: ${backendResponse.status()}`);
      }
    } catch (error) {
      console.warn('⚠️ Backend API not available');
    }

    console.log('✅ Global setup completed');

    // Create test data directory
    try {
      await page.evaluate(() => {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('test-setup-complete', 'true');
        }
      });
    } catch (error) {
      // Ignore localStorage errors in cross-origin contexts
      console.log('Note: localStorage not accessible during setup');
    }

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;