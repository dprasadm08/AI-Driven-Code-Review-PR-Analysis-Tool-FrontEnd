import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../utils/token-storage';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenStorage = new TokenStorageService();
  private currentUserSubject = new BehaviorSubject<any>(this.tokenStorage.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Login user with username and password
   */
  login(username: string, password: string): Observable<LoginResponse> {
    // Validate inputs
    if (!username || !password) {
      return throwError(() => new Error('Username and password are required'));
    }

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      { username, password },
      httpOptions
    ).pipe(
      tap((response: LoginResponse) => {
        if (response.token) {
          this.tokenStorage.saveToken(response.token);
          this.tokenStorage.saveUser(response.user);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Register new user
   */
  register(username: string, email: string, password: string): Observable<RegisterResponse> {
    // Validate inputs
    if (!username || !email || !password) {
      return throwError(() => new Error('All fields are required'));
    }

    if (!this.isValidEmail(email)) {
      return throwError(() => new Error('Invalid email format'));
    }

    if (password.length < 6) {
      return throwError(() => new Error('Password must be at least 6 characters'));
    }

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/auth/register`,
      { username, email, password },
      httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = this.tokenStorage.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    return !this.isTokenExpired(token);
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  /**
   * Get current logged in user
   */
  getCurrentUser(): any {
    return this.tokenStorage.getUser();
  }

  /**
   * Refresh auth token
   */
  refreshToken(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/refresh`,
      {},
      httpOptions
    ).pipe(
      tap((response: any) => {
        if (response.token) {
          this.tokenStorage.saveToken(response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } catch (error) {
      return true;
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.status === 409) {
        errorMessage = 'Username or email already exists';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
