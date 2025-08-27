/**
 * BigFootLive Enterprise Features Test Suite
 * 
 * This suite validates all new enterprise functionality including:
 * - Feature Flags Management
 * - Events DataTable CRUD Operations  
 * - WebRTC Multi-Presenter
 * - Closed Captioning System
 * - Overlays and Lower Thirds
 * - VOD/Assets Management
 * - Platform Administration
 */

import { test } from '@playwright/test';

// Import all enterprise feature tests
import './13-feature-flags.spec';
import './14-events-datatable.spec';
import './15-webrtc-multi-presenter.spec';
import './16-closed-captioning.spec';
import './17-overlays-lower-thirds.spec';

test.describe('Enterprise Features Integration Suite', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    console.log('🚀 Starting BigFootLive Enterprise Features Test Suite');
    console.log('📋 Test Categories:');
    console.log('  ✓ Feature Flags Management');
    console.log('  ✓ Events DataTable CRUD');
    console.log('  ✓ WebRTC Multi-Presenter');
    console.log('  ✓ Closed Captioning');
    console.log('  ✓ Overlays & Lower Thirds');
    console.log('----------------------------------------');
  });

  test.afterAll(async () => {
    console.log('----------------------------------------');
    console.log('✅ Enterprise Features Test Suite Complete');
  });
});

// Test execution profiles for different scenarios
export const testProfiles = {
  // Quick smoke test - essential features only
  smoke: {
    specs: [
      './13-feature-flags.spec.ts',
      './14-events-datatable.spec.ts'
    ],
    workers: 4,
    retries: 0,
    timeout: 30000
  },

  // Full regression test - all features
  regression: {
    specs: [
      './13-feature-flags.spec.ts',
      './14-events-datatable.spec.ts', 
      './15-webrtc-multi-presenter.spec.ts',
      './16-closed-captioning.spec.ts',
      './17-overlays-lower-thirds.spec.ts'
    ],
    workers: 2,
    retries: 1,
    timeout: 60000
  },

  // Performance test - focus on streaming features
  performance: {
    specs: [
      './15-webrtc-multi-presenter.spec.ts',
      './16-closed-captioning.spec.ts',
      './17-overlays-lower-thirds.spec.ts'
    ],
    workers: 1,
    retries: 0,
    timeout: 120000,
    video: 'on',
    trace: 'on'
  },

  // CI/CD pipeline test
  ci: {
    specs: [
      './13-feature-flags.spec.ts',
      './14-events-datatable.spec.ts',
      './15-webrtc-multi-presenter.spec.ts',
      './16-closed-captioning.spec.ts',
      './17-overlays-lower-thirds.spec.ts'
    ],
    workers: process.env.CI ? 1 : 2,
    retries: process.env.CI ? 2 : 0,
    timeout: 90000,
    reporter: [
      ['html', { open: 'never' }],
      ['json', { outputFile: 'test-results.json' }],
      ['junit', { outputFile: 'junit.xml' }]
    ]
  }
};

// Helper to run specific test profile
export async function runTestProfile(profileName: keyof typeof testProfiles) {
  const profile = testProfiles[profileName];
  console.log(`Running test profile: ${profileName}`);
  console.log(`Configuration:`, profile);
  
  // This would be executed by the test runner
  return profile;
}

// Export test metadata for reporting
export const testMetadata = {
  suite: 'Enterprise Features',
  version: '2.0.0',
  features: {
    featureFlags: {
      tests: 10,
      priority: 'high',
      dependencies: ['auth', 'admin']
    },
    eventsDataTable: {
      tests: 11,
      priority: 'high', 
      dependencies: ['auth', 'database']
    },
    webrtcMultiPresenter: {
      tests: 11,
      priority: 'critical',
      dependencies: ['webrtc', 'streaming']
    },
    closedCaptioning: {
      tests: 10,
      priority: 'high',
      dependencies: ['streaming', 'ai-services']
    },
    overlaysLowerThirds: {
      tests: 10,
      priority: 'medium',
      dependencies: ['streaming', 'graphics']
    }
  },
  totalTests: 52,
  estimatedDuration: '15-20 minutes',
  requiredServices: [
    'backend-api',
    'websocket-server',
    'webrtc-sfu',
    'caption-service',
    'overlay-compositor'
  ]
};