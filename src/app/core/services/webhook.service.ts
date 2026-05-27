import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Webhook,
  WebhookConfig,
  WebhookStats,
  WebhookSetupInstructions,
  WebhookTestResult
} from '../models/webhook.model';

/**
 * Webhook Service - Manages webhook configuration and status
 */
@Injectable({
  providedIn: 'root'
})
export class WebhookService {
  private apiUrl = `${environment.apiUrl}/webhooks`;
  private webhooksSubject = new BehaviorSubject<Webhook[]>([]);
  public webhooks$ = this.webhooksSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all webhooks
   */
  getWebhooks(): Observable<Webhook[]> {
    return this.http.get<Webhook[]>(this.apiUrl).pipe(
      tap(webhooks => this.webhooksSubject.next(webhooks)),
      catchError(this.handleError)
    );
  }

  /**
   * Get webhook by ID
   */
  getWebhookById(id: string): Observable<Webhook> {
    return this.http.get<Webhook>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get webhooks by repository
   */
  getWebhooksByRepository(repositoryId: string): Observable<Webhook[]> {
    return this.http.get<Webhook[]>(`${this.apiUrl}/repository/${repositoryId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create webhook
   */
  createWebhook(config: WebhookConfig): Observable<Webhook> {
    return this.http.post<Webhook>(this.apiUrl, config).pipe(
      tap(webhook => {
        const currentWebhooks = this.webhooksSubject.value;
        this.webhooksSubject.next([...currentWebhooks, webhook]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update webhook
   */
  updateWebhook(id: string, updates: Partial<Webhook>): Observable<Webhook> {
    return this.http.put<Webhook>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updatedWebhook => {
        const currentWebhooks = this.webhooksSubject.value;
        const index = currentWebhooks.findIndex(w => w.id === id);
        if (index !== -1) {
          currentWebhooks[index] = updatedWebhook;
          this.webhooksSubject.next([...currentWebhooks]);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete webhook
   */
  deleteWebhook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentWebhooks = this.webhooksSubject.value;
        this.webhooksSubject.next(currentWebhooks.filter(w => w.id !== id));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Test webhook
   */
  testWebhook(id: string): Observable<WebhookTestResult> {
    return this.http.post<WebhookTestResult>(`${this.apiUrl}/${id}/test`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats(): Observable<WebhookStats> {
    return this.http.get<WebhookStats>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get setup instructions
   */
  getSetupInstructions(repositoryId: string): Observable<WebhookSetupInstructions> {
    return this.http.get<WebhookSetupInstructions>(`${this.apiUrl}/setup-instructions/${repositoryId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sync webhooks with GitHub
   */
  syncWebhooks(): Observable<Webhook[]> {
    return this.http.post<Webhook[]>(`${this.apiUrl}/sync`, {}).pipe(
      tap(webhooks => this.webhooksSubject.next(webhooks)),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.status === 404) {
        errorMessage = 'Webhook not found';
      } else if (error.status === 409) {
        errorMessage = 'Webhook already exists';
      } else if (error.status === 422) {
        errorMessage = error.error?.message || 'Invalid webhook configuration';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Webhook Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
