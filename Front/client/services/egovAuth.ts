// eGov.kz OAuth configuration and utilities
// Reference: https://idp.egov.kz/idp/login

export interface EgovConfig {
  clientId: string;
  redirectUri: string;
  clientSecret?: string;
  scope?: string;
}

export interface EgovUser {
  iin?: string; // Individual Identification Number
  email?: string;
  phone?: string;
  fullName?: string;
  id?: string;
  attributes?: Record<string, any>;
}

class EgovAuthService {
  private config: EgovConfig;
  private baseUrl = 'https://idp.egov.kz';

  constructor(config: EgovConfig) {
    this.config = {
      scope: 'openid email profile phone',
      ...config,
    };
  }

  /**
   * Generate the OAuth authorization URL
   * Redirects user to eGov.kz login page
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope || 'openid email profile phone',
      ...(state && { state }),
    });

    return `${this.baseUrl}/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Redirect user to eGov.kz login page
   * After eGov authentication, user will be redirected back to the callback URL
   */
  redirectToLogin(state?: string): void {
    const authUrl = this.getAuthorizationUrl(state);
    console.log('Redirecting to eGov:', authUrl);
    window.location.href = authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * This should be called from your backend for security
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    expires_in: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: this.config.clientId,
          redirect_uri: this.config.redirectUri,
          ...(this.config.clientSecret && { client_secret: this.config.clientSecret }),
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('eGov token exchange error:', error);
      throw error;
    }
  }

  /**
   * Get user information from access token
   */
  async getUserInfo(accessToken: string): Promise<EgovUser> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.sub,
        email: data.email,
        phone: data.phone_number,
        iin: data.iin,
        fullName: data.name,
        attributes: data,
      };
    } catch (error) {
      console.error('eGov user info error:', error);
      throw error;
    }
  }

  /**
   * Check if user has valid session
   */
  isAuthenticated(token?: string): boolean {
    if (!token) {
      token = localStorage.getItem('egov_access_token');
    }
    return !!token;
  }

  /**
   * Store tokens in localStorage
   */
  storeTokens(accessToken: string, idToken?: string, refreshToken?: string): void {
    localStorage.setItem('egov_access_token', accessToken);
    if (idToken) localStorage.setItem('egov_id_token', idToken);
    if (refreshToken) localStorage.setItem('egov_refresh_token', refreshToken);
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem('egov_access_token');
    localStorage.removeItem('egov_id_token');
    localStorage.removeItem('egov_refresh_token');
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('egov_access_token');
  }
}

// Export singleton instance factory
export function createEgovAuth(config: EgovConfig): EgovAuthService {
  return new EgovAuthService(config);
}

// Create default auth instance with environment variables
export function getDefaultEgovAuth(): EgovAuthService {
  return new EgovAuthService({
    clientId: import.meta.env.VITE_EGOV_CLIENT_ID || 'freelancekz-app',
    redirectUri: `${window.location.origin}/auth/egov/callback`,
    clientSecret: import.meta.env.VITE_EGOV_CLIENT_SECRET,
    scope: 'openid email profile phone',
  });
}

export default EgovAuthService;
