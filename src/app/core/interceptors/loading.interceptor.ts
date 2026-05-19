import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

/**
 * Loading Interceptor - Tracks HTTP request loading states
 * Can be used with a loading service to show/hide loading indicators
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Increment active requests
    this.activeRequests++;
    this.updateLoadingState(true);

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Request completed successfully
        }
      }),
      finalize(() => {
        // Decrement active requests
        this.activeRequests--;
        
        if (this.activeRequests === 0) {
          this.updateLoadingState(false);
        }
      })
    );
  }

  /**
   * Update global loading state
   * In a real app, this would dispatch to a loading service/state management
   */
  private updateLoadingState(isLoading: boolean): void {
    // You can emit this to a LoadingService or NgRx store
    // For now, we'll just log it
    if (isLoading && this.activeRequests === 1) {
      console.log('Loading started');
    } else if (!isLoading && this.activeRequests === 0) {
      console.log('Loading finished');
    }
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.activeRequests > 0;
  }
}
