import { FullConfig } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  try {
    // Clean up test artifacts
    const testResultsDir = path.join(process.cwd(), 'test-results');
    const playwrightReportDir = path.join(process.cwd(), 'playwright-report');

    // Archive old test results if they exist
    if (await fileExists(testResultsDir)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveDir = path.join(process.cwd(), 'archived-results', timestamp);
      
      await fs.mkdir(path.dirname(archiveDir), { recursive: true });
      await fs.rename(testResultsDir, archiveDir);
      console.log(`📁 Archived test results to ${archiveDir}`);
    }

    // Clean up authentication files if not in CI
    // Commented out for now - auth file is needed for tests
    // if (!process.env.CI) {
    //   const authFile = path.join(process.cwd(), 'tests', 'auth', 'user.json');
    //   if (await fileExists(authFile)) {
    //     await fs.unlink(authFile);
    //     console.log('🔐 Cleaned up authentication state');
    //   }
    // }

    console.log('✅ Global teardown completed');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export default globalTeardown;