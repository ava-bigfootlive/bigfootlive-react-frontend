import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

// Get environment variables
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const region = import.meta.env.VITE_COGNITO_REGION || 'us-west-1';

console.log('🏗️ Amplify configuration starting...', {
  hasUserPoolId: !!userPoolId,
  hasClientId: !!clientId,
  region,
  userPoolId: userPoolId ? `${userPoolId.slice(0, 10)}...` : 'MISSING',
  clientId: clientId ? `${clientId.slice(0, 10)}...` : 'MISSING'
});

// Only configure Amplify if we have the required environment variables
if (!userPoolId || !clientId) {
  console.error('❌ CRITICAL: Missing Amplify environment variables!');
  console.error('Required: VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID');
  throw new Error('Missing required Cognito environment variables');
}

try {
  const amplifyConfig = {
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId: clientId,
        region,
        // Ensure we allow username sign-in (email as username)
        loginWith: {
          email: true
        }
      }
    }
  };

  // Configure Amplify
  Amplify.configure(amplifyConfig);
  console.log('✅ Amplify configured successfully');
  
  // Test that Amplify is working
  console.log('🔍 Testing Amplify configuration...');
  const currentConfig = Amplify.getConfig();
  console.log('📊 Amplify config loaded:', !!currentConfig?.Auth?.Cognito);
  
} catch (error) {
  console.error('❌ Failed to configure Amplify:', error);
  throw error;
}

// Configure storage for authentication tokens
const hostname = window.location.hostname;
const isProductionDomain = hostname.includes('bigfootlive.io') || hostname.includes('cloudfront.net');
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

console.log('🍪 Storage configuration:', { hostname, isProductionDomain, isLocalhost });

if (isProductionDomain) {
  console.log('🏭 Configuring production cookie storage...');
  // Configure cookie storage for cross-subdomain authentication in production
  cognitoUserPoolsTokenProvider.setKeyValueStorage({
    async setItem(key: string, value: string): Promise<void> {
      document.cookie = `${key}=${encodeURIComponent(value)}; domain=.bigfootlive.io; path=/; secure; samesite=lax; max-age=604800`;
    },
    async getItem(key: string): Promise<string | null> {
      const name = key + '=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookies = decodedCookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length);
        }
      }
      return null;
    },
    async removeItem(key: string): Promise<void> {
      document.cookie = `${key}=; domain=.bigfootlive.io; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure`;
    },
    async clear(): Promise<void> {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [key] = cookie.trim().split('=');
        if (key.includes('CognitoIdentityServiceProvider') || 
            key.includes('amplify') || 
            key.includes('LastAuthUser')) {
          document.cookie = `${key}=; domain=.bigfootlive.io; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure`;
        }
      }
    }
  });
} else if (isLocalhost) {
  console.log('🛠️ Using localStorage for development (localhost)...');
  // For localhost development, use default localStorage (no custom storage needed)
  // This ensures tokens persist correctly during development
} else {
  console.log('🌐 Using default storage for unknown domain...');
}

// Export a placeholder since the config is applied directly to Amplify
export default {};