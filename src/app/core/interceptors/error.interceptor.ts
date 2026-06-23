import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ErrorService } from '../services/error.service';

/**
 * Error Interceptor - Handles HTTP errors globally
 * Provides retry logic, user-friendly error messages, and centralized error handling
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      // Retry failed requests (except for certain status codes)
      retry({
        count: 1,
        delay: (error: HttpErrorResponse) => {
          // Don't retry on client errors (4xx) or auth errors
          if (error.status >= 400 && error.status < 500) {
            throw error;
          }
          return throwError(() => error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message || 'Network error occurred';
          console.error('Client-side error:', errorMessage);
        } else {
          // Server-side or network error
          errorMessage = this.getServerErrorMessage(error);
          console.error(`HTTP Error (${error.status}):`, errorMessage);
        }

        // Emit error to global error service for UI handling
        this.errorService.handleHttpError(
          error.status || 0,
          error.statusText || 'Unknown Error',
          errorMessage,
          error.url || req.url,
          error.error
        );

        // Log error for debugging
        this.logError(error);

        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          error: error.error
        }));
      })
    );
  }

  /**
   * Get user-friendly error message based on status code
   */
  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return error.error?.message || 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access forbidden. You don\'t have permission.';
      case 404:
        return error.error?.message || 'Resource not found.';
      case 409:
        return error.error?.message || 'Conflict. Resource already exists.';
      case 422:
        return error.error?.message || 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.error?.message || `Server error: ${error.status}`;
    }
  }

  /**
   * Log error details for debugging
   */
  private logError(error: HttpErrorResponse): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      url: error.url,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      error: error.error
    };

    // In production, you might want to send this to a logging service
    if (error.status >= 500) {
      console.error('Server Error Log:', errorLog);
    }
  }
}
