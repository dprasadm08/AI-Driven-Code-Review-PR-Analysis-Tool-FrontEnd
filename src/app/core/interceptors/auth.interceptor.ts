import { Injectable } from '@angular/core';
import { 
  HttpEvent, 
  HttpInterceptor, 
  HttpHandler, 
  HttpRequest,
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor for JWT Authentication
 * Automatically adds JWT token to outgoing requests
 * Handles token refresh on 401 errors
 * Redirects to login on authentication failures
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to request if available
    const authReq = this.addToken(req);
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        
        if (error.status === 403) {
          console.error('Access forbidden:', error);
          this.router.navigate(['/dashboard']);
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Add JWT token to request headers
   */
  private addToken(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    
    // Don't add token to auth endpoints
    if (this.isAuthEndpoint(request.url)) {
      return request;
    }
    
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    return request;
  }

  /**
   * Check if the URL is an auth endpoint
   */
  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') || 
           url.includes('/auth/register') ||
           url.includes('/auth/refresh');
  }

  /**
   * Handle 401 Unauthorized errors
   * Attempt to refresh token or redirect to login
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Attempt to refresh token
      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.token);
          
          // Retry the failed request with new token
          return next.handle(this.addToken(request));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          
          // Refresh failed, logout and redirect to login
          console.error('Token refresh failed:', error);
          this.authService.logout();
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: this.router.url, sessionExpired: true }
          });
          
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => {
          return next.handle(this.addToken(request));
        })
      );
    }
  }
}
