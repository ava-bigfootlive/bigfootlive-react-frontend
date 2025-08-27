import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      region: import.meta.env.VITE_COGNITO_REGION || 'us-west-1'
    }
  }
};

// Configure Amplify
Amplify.configure(amplifyConfig);

// Only configure cookie storage for production domains
const hostname = window.location.hostname;
const isProductionDomain = hostname.includes('bigfootlive.io') || hostname.includes('cloudfront.net');

if (isProductionDomain) {
  // Configure cookie storage for cross-subdomain authentication
  cognitoUserPoolsTokenProvider.setKeyValueStorage({
    async setItem(key: string, value: string): Promise<void> {
      // Set cookie with domain that works across subdomains
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
      // Clear all Cognito-related cookies
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
}

export default amplifyConfig;