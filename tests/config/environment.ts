export interface EnvironmentConfig {
  frontend: {
    baseUrl: string;
    timeout: number;
  };
  backend: {
    apiUrl: string;
    timeout: number;
  };
  streaming: {
    baseUrl: string;
    rtmpPort: number;
    hlsTimeout: number;
  };
  auth: {
    region: string;
    userPoolId: string;
    clientId: string;
    testUsers: {
      streamer: { username: string; password: string; };
      viewer: { username: string; password: string; };
      moderator: { username: string; password: string; };
    };
  };
  thresholds: {
    pageLoad: number;
    apiResponse: number;
    streamStart: number;
    chatMessage: number;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  local: {
    frontend: {
      baseUrl: 'http://localhost:3000',
      timeout: 30000,
    },
    backend: {
      apiUrl: 'http://localhost:8000',
      timeout: 15000,
    },
    streaming: {
      baseUrl: 'http://localhost:8080',
      rtmpPort: 1935,
      hlsTimeout: 45000,
    },
    auth: {
      region: 'us-west-1',
      userPoolId: process.env.COGNITO_USER_POOL_ID || '',
      clientId: process.env.COGNITO_CLIENT_ID || '',
      testUsers: {
        streamer: {
          username: process.env.TEST_STREAMER_USERNAME || 'test-streamer@example.com',
          password: process.env.TEST_STREAMER_PASSWORD || 'TestPass123!',
        },
        viewer: {
          username: process.env.TEST_VIEWER_USERNAME || 'test-viewer@example.com',
          password: process.env.TEST_VIEWER_PASSWORD || 'TestPass123!',
        },
        moderator: {
          username: process.env.TEST_MODERATOR_USERNAME || 'test-mod@example.com',
          password: process.env.TEST_MODERATOR_PASSWORD || 'TestPass123!',
        },
      },
    },
    thresholds: {
      pageLoad: 3000,
      apiResponse: 2000,
      streamStart: 10000,
      chatMessage: 1000,
    },
  },

  production: {
    frontend: {
      baseUrl: 'https://bigfootlive.io',
      timeout: 60000,
    },
    backend: {
      apiUrl: 'https://api.bigfootlive.io',
      timeout: 30000,
    },
    streaming: {
      baseUrl: 'http://stream.bigfootlive.io',
      rtmpPort: 1935,
      hlsTimeout: 60000,
    },
    auth: {
      region: 'us-west-1',
      userPoolId: process.env.COGNITO_USER_POOL_ID || '',
      clientId: process.env.COGNITO_CLIENT_ID || '',
      testUsers: {
        streamer: {
          username: process.env.PROD_TEST_STREAMER_USERNAME || '',
          password: process.env.PROD_TEST_STREAMER_PASSWORD || '',
        },
        viewer: {
          username: process.env.PROD_TEST_VIEWER_USERNAME || '',
          password: process.env.PROD_TEST_VIEWER_PASSWORD || '',
        },
        moderator: {
          username: process.env.PROD_TEST_MODERATOR_USERNAME || '',
          password: process.env.PROD_TEST_MODERATOR_PASSWORD || '',
        },
      },
    },
    thresholds: {
      pageLoad: 5000,
      apiResponse: 3000,
      streamStart: 15000,
      chatMessage: 2000,
    },
  },
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.PLAYWRIGHT_ENV || 'local';
  const config = environments[env];
  
  if (!config) {
    throw new Error(`Unknown environment: ${env}`);
  }
  
  return config;
}

export const ENV = getEnvironmentConfig();