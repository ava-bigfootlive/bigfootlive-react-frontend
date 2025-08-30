import { 
  CognitoUserPool, 
  CognitoUser, 
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'us-west-1_6IUovRAM1',
  ClientId: '1vk1puqortjm4kk08kh0u1otaj'
};

const userPool = new CognitoUserPool(poolData);

export interface User {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  tenantId?: string;
  roles?: string[];
  role?: string;
}

export const cognitoService = {
  getCurrentUser(): CognitoUser | null {
    return userPool.getCurrentUser();
  },

  getSession(): Promise<CognitoUserSession | null> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      currentUser.getSession((err: any, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      });
    });
  },

  getUserAttributes(user?: CognitoUser): Promise<Record<string, string> | null> {
    const currentUser = user || this.getCurrentUser();
    if (!currentUser) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      // First ensure we have a valid session
      currentUser.getSession((sessionErr: any, session: CognitoUserSession | null) => {
        if (sessionErr || !session) {
          reject(sessionErr || new Error('No session'));
          return;
        }
        
        currentUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
          } else {
            const attrs: Record<string, string> = {};
            attributes?.forEach(attr => {
              attrs[attr.Name] = attr.Value;
            });
            resolve(attrs);
          }
        });
      });
    });
  },

  async getUserData(): Promise<User | null> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const session = await this.getSession();
      if (!session || !session.isValid()) return null;

      const attributes = await this.getUserAttributes();
      if (!attributes) return null;

      const idToken = session.getIdToken();
      const payload = idToken.decodePayload();
      
      const userGroups = payload['cognito:groups'] || [];
      const isPlatformAdmin = userGroups.includes('platform_admin');

      return {
        id: payload.sub,
        email: attributes.email || '',
        given_name: attributes.given_name,
        family_name: attributes.family_name,
        firstName: attributes.given_name,
        lastName: attributes.family_name,
        username: currentUser.getUsername(),
        tenantId: attributes['custom:tenant_id'],
        roles: attributes['custom:roles']?.split(',') || [],
        role: isPlatformAdmin ? 'platform_admin' : 'user'
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  signIn(email: string, password: string): Promise<{ session: CognitoUserSession; user: User }> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (session) => {
          try {
            // Log the session tokens immediately after successful auth
            console.log('Sign-in successful, session tokens:', {
              accessToken: session.getAccessToken().getJwtToken().substring(0, 20) + '...',
              idToken: session.getIdToken().getJwtToken().substring(0, 20) + '...',
              refreshToken: session.getRefreshToken().getToken().substring(0, 20) + '...'
            });
            
            // Check what's in localStorage right after sign-in
            setTimeout(() => {
              const allKeys = Object.keys(localStorage).filter(key => key.includes('CognitoIdentityServiceProvider'));
              console.log('localStorage keys after sign-in:', allKeys);
              allKeys.forEach(key => {
                if (key.includes('accessToken')) {
                  console.log(`Found access token in localStorage at key: ${key}`);
                }
              });
            }, 100);
            
            // Get user attributes right after successful authentication
            const attributes = await this.getUserAttributes(cognitoUser);
            if (!attributes) throw new Error('Failed to get user attributes');

            const idToken = session.getIdToken();
            const payload = idToken.decodePayload();
            
            const userGroups = payload['cognito:groups'] || [];
            const isPlatformAdmin = userGroups.includes('platform_admin');

            const userData: User = {
              id: payload.sub,
              email: attributes.email || '',
              given_name: attributes.given_name,
              family_name: attributes.family_name,
              firstName: attributes.given_name,
              lastName: attributes.family_name,
              username: cognitoUser.getUsername(),
              tenantId: attributes['custom:tenant_id'],
              roles: attributes['custom:roles']?.split(',') || [],
              role: isPlatformAdmin ? 'platform_admin' : 'user'
            };

            // Manually store tokens in localStorage to ensure they persist
            const username = cognitoUser.getUsername();
            localStorage.setItem(`CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.LastAuthUser`, username);
            localStorage.setItem(`CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.${username}.accessToken`, session.getAccessToken().getJwtToken());
            localStorage.setItem(`CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.${username}.idToken`, session.getIdToken().getJwtToken());
            localStorage.setItem(`CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.${username}.refreshToken`, session.getRefreshToken().getToken());
            
            console.log('Manually stored tokens in localStorage');
            
            resolve({ session, user: userData });
          } catch (error) {
            reject(new Error(`Failed to get user data: ${error}`));
          }
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          reject(new Error('New password required'));
        }
      });
    });
  },

  signOut(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
  },

  signUp(email: string, password: string, attributes?: { given_name?: string; family_name?: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      const attributeList: CognitoUserAttribute[] = [];
      
      attributeList.push(new CognitoUserAttribute({
        Name: 'email',
        Value: email
      }));

      if (attributes?.given_name) {
        attributeList.push(new CognitoUserAttribute({
          Name: 'given_name',
          Value: attributes.given_name
        }));
      }

      if (attributes?.family_name) {
        attributeList.push(new CognitoUserAttribute({
          Name: 'family_name',
          Value: attributes.family_name
        }));
      }

      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  confirmSignUp(email: string, code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  resetPassword(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  confirmResetPassword(email: string, code: string, newPassword: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve('Password reset successful');
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  async getAccessToken(): Promise<string | null> {
    try {
      // Debug: Log all localStorage keys to see what's actually stored
      const cognitoKeys = Object.keys(localStorage).filter(k => k.includes('CognitoIdentityServiceProvider'));
      console.log('All Cognito keys in localStorage:', cognitoKeys);
      
      // First try to get from current user's session
      const currentUser = this.getCurrentUser();
      console.log('Current user:', currentUser ? currentUser.getUsername() : 'null');
      
      if (currentUser) {
        try {
          const session = await this.getSession();
          if (session && session.isValid()) {
            const accessToken = session.getAccessToken().getJwtToken();
            console.log('Got access token from session:', accessToken ? accessToken.substring(0, 30) + '...' : 'null');
            return accessToken;
          }
        } catch (err) {
          console.log('Could not get session:', err);
        }
      }
      
      // Fallback to direct localStorage access
      const lastUser = localStorage.getItem(`CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.LastAuthUser`);
      console.log('LastAuthUser from localStorage:', lastUser);
      
      if (lastUser) {
        // Try both possible token keys (sometimes it's idToken, sometimes accessToken)
        const idTokenKey = `CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.${lastUser}.idToken`;
        const accessTokenKey = `CognitoIdentityServiceProvider.1vk1puqortjm4kk08kh0u1otaj.${lastUser}.accessToken`;
        
        const idToken = localStorage.getItem(idTokenKey);
        const accessToken = localStorage.getItem(accessTokenKey);
        
        console.log('ID token exists:', !!idToken);
        console.log('Access token exists:', !!accessToken);
        
        // Return access token if available, otherwise return ID token
        // Some APIs accept ID tokens for authorization
        if (accessToken) {
          console.log('Returning access token from localStorage');
          return accessToken;
        } else if (idToken) {
          console.log('Returning ID token from localStorage (fallback)');
          return idToken;
        }
      }

      console.log('No token available - user needs to authenticate');
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }
};