const TOKEN_KEY = 'ai-pr-review-token';
const USER_KEY = 'ai-pr-review-user';
const REFRESH_TOKEN_KEY = 'ai-pr-review-refresh-token';

/**
 * Service for managing JWT tokens and user data in browser storage
 * Uses sessionStorage by default for security, with localStorage option for "Remember Me"
 */
export class TokenStorageService {
  private useLocalStorage = false;

  /**
   * Set storage type (session or local)
   */
  setStorageType(useLocal: boolean): void {
    this.useLocalStorage = useLocal;
  }

  /**
   * Get the appropriate storage object
   */
  private getStorage(): Storage {
    return this.useLocalStorage ? window.localStorage : window.sessionStorage;
  }

  /**
   * Clear all authentication data
   */
  signOut(): void {
    const storage = this.getStorage();
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    
    // Also clear from both storages to be safe
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Save JWT access token
   */
  public saveToken(token: string): void {
    const storage = this.getStorage();
    storage.removeItem(TOKEN_KEY);
    storage.setItem(TOKEN_KEY, token);
  }

  /**
   * Get JWT access token
   */
  public getToken(): string | null {
    // Check both storages
    return this.getStorage().getItem(TOKEN_KEY) || 
           window.localStorage.getItem(TOKEN_KEY) ||
           window.sessionStorage.getItem(TOKEN_KEY);
  }

  /**
   * Save refresh token
   */
  public saveRefreshToken(token: string): void {
    const storage = this.getStorage();
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token
   */
  public getRefreshToken(): string | null {
    return this.getStorage().getItem(REFRESH_TOKEN_KEY) ||
           window.localStorage.getItem(REFRESH_TOKEN_KEY) ||
           window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Save user data
   */
  public saveUser(user: any): void {
    const storage = this.getStorage();
    storage.removeItem(USER_KEY);
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data
   */
  public getUser(): any {
    const userStr = this.getStorage().getItem(USER_KEY) ||
                    window.localStorage.getItem(USER_KEY) ||
                    window.sessionStorage.getItem(USER_KEY);
    
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if token exists
   */
  public hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Get token expiration time
   */
  public getTokenExpiration(): Date | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        return new Date(payload.exp * 1000);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return null;
  }
}
