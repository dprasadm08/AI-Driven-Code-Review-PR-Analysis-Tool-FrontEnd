import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppError, ErrorType } from '../models/error.model';

/**
 * Global error service for centralized error handling and notification
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errors$ = new BehaviorSubject<AppError[]>([]);
  private currentError$ = new BehaviorSubject<AppError | null>(null);
  private errorNotifications$ = new BehaviorSubject<AppError | null>(null);

  constructor() {
    // Auto-dismiss errors after 8 seconds
    this.errors$.subscribe(() => {
      this.scheduleAutoDismiss();
    });
  }

  /**
   * Emit a new error
   */
  addError(error: AppError): void {
    const errors = this.errors$.value;
    const newError = {
      ...error,
      id: error.id || this.generateErrorId(),
      dismissible: error.dismissible !== false,
      timestamp: error.timestamp || new Date()
    };

    this.errors$.next([...errors, newError]);
    this.currentError$.next(newError);
    this.errorNotifications$.next(newError);

    console.error(`[${newError.type.toUpperCase()}] Error ${newError.status}:`, newError.message);
  }

  /**
   * Create and add error from HttpErrorResponse
   */
  handleHttpError(status: number, statusText: string, message: string, url?: string, details?: any): void {
    const errorType = this.getErrorType(status);
    const error: AppError = {
      status,
      statusText,
      message,
      type: errorType,
      url,
      details,
      timestamp: new Date(),
      retryable: this.isRetryable(status)
    };

    this.addError(error);
  }

  /**
   * Get all current errors
   */
  getErrors(): Observable<AppError[]> {
    return this.errors$.asObservable();
  }

  /**
   * Get current error (most recent)
   */
  getCurrentError(): Observable<AppError | null> {
    return this.currentError$.asObservable();
  }

  /**
   * Get error notifications for UI display
   */
  getErrorNotifications(): Observable<AppError | null> {
    return this.errorNotifications$.asObservable();
  }

  /**
   * Dismiss a specific error
   */
  dismissError(errorId: string): void {
    const errors = this.errors$.value.filter(e => e.id !== errorId);
    this.errors$.next(errors);
    if (this.currentError$.value?.id === errorId) {
      this.currentError$.next(errors.length > 0 ? errors[errors.length - 1] : null);
    }
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors$.next([]);
    this.currentError$.next(null);
  }

  /**
   * Determine error type from HTTP status code
   */
  private getErrorType(status: number): ErrorType {
    if (status === 0) return 'network';
    if (status === 408 || status === 504) return 'timeout';
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    if (status === 404) return 'notfound';
    if (status === 409) return 'conflict';
    if (status === 422) return 'validation';
    if (status >= 500) return 'server';
    return 'unknown';
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(status: number): boolean {
    // Retry on network errors, timeouts, and server errors
    return status === 0 || status === 408 || status === 504 || status >= 500;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Schedule auto-dismiss for dismissible errors
   */
  private scheduleAutoDismiss(): void {
    setTimeout(() => {
      const errors = this.errors$.value;
      const stillDismissible = errors.filter(e => e.dismissible);
      if (stillDismissible.length > 0) {
        const errorToDismiss = stillDismissible[0];
        this.dismissError(errorToDismiss.id!);
      }
    }, 8000);
  }

  /**
   * Get user-friendly message based on error type
   */
  getErrorTitle(type: ErrorType): string {
    const titles: Record<ErrorType, string> = {
      network: 'Network Connection Error',
      timeout: 'Request Timeout',
      unauthorized: 'Unauthorized Access',
      forbidden: 'Access Denied',
      notfound: 'Not Found',
      conflict: 'Conflict',
      validation: 'Validation Error',
      server: 'Server Error',
      unknown: 'Error'
    };
    return titles[type];
  }

  /**
   * Get error icon based on type
   */
  getErrorIcon(type: ErrorType): string {
    const icons: Record<ErrorType, string> = {
      network: '📡',
      timeout: '⏱️',
      unauthorized: '🔐',
      forbidden: '🚫',
      notfound: '❌',
      conflict: '⚠️',
      validation: '✍️',
      server: '🖥️',
      unknown: '❓'
    };
    return icons[type];
  }
}
