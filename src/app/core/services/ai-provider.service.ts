import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AIProvider,
  AIModel,
  ProviderConfig,
  ProviderSelection,
  ProviderStats,
  AIProviderType,
  ModelCapability
} from '../models/ai-provider.model';

/**
 * AI Provider Service - Manages AI provider selection and configuration
 */
@Injectable({
  providedIn: 'root'
})
export class AIProviderService {
  private apiUrl = `${environment.apiUrl}/ai-providers`;
  
  private providersSubject = new BehaviorSubject<AIProvider[]>([]);
  private selectedProviderSubject = new BehaviorSubject<ProviderSelection | null>(null);
  private statsSubject = new BehaviorSubject<ProviderStats | null>(null);

  public providers$ = this.providersSubject.asObservable();
  public selectedProvider$ = this.selectedProviderSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeProviders();
  }

  /**
   * Initialize default providers
   */
  private initializeProviders(): void {
    const defaultProviders: AIProvider[] = [
      {
        id: 'openai',
        name: 'OpenAI',
        displayName: 'OpenAI GPT',
        description: 'Latest GPT models from OpenAI with advanced reasoning capabilities',
        icon: '🤖',
        isActive: true,
        apiKeyRequired: true,
        configUrl: 'https://platform.openai.com/api-keys',
        features: ['Code Analysis', 'Security Review', 'Performance Optimization'],
        supportedModels: [
          {
            id: 'gpt-4',
            name: 'GPT-4',
            displayName: 'GPT-4 Turbo',
            capabilities: [ModelCapability.CODE_REVIEW, ModelCapability.SECURITY_ANALYSIS, ModelCapability.BEST_PRACTICES],
            maxTokens: 128000,
            costPer1kTokens: 0.01
          },
          {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            displayName: 'GPT-3.5 Turbo',
            capabilities: [ModelCapability.CODE_REVIEW, ModelCapability.BEST_PRACTICES],
            maxTokens: 4096,
            costPer1kTokens: 0.0005
          }
        ]
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        displayName: 'Claude',
        description: 'Claude AI models optimized for code understanding and analysis',
        icon: '🧠',
        isActive: true,
        apiKeyRequired: true,
        configUrl: 'https://console.anthropic.com/keys',
        features: ['Code Review', 'Documentation', 'Testing'],
        supportedModels: [
          {
            id: 'claude-3-opus',
            name: 'Claude 3 Opus',
            displayName: 'Claude 3 Opus',
            capabilities: [ModelCapability.CODE_REVIEW, ModelCapability.SECURITY_ANALYSIS, ModelCapability.BEST_PRACTICES],
            maxTokens: 200000,
            costPer1kTokens: 0.015
          },
          {
            id: 'claude-3-sonnet',
            name: 'Claude 3 Sonnet',
            displayName: 'Claude 3 Sonnet',
            capabilities: [ModelCapability.CODE_REVIEW, ModelCapability.BEST_PRACTICES],
            maxTokens: 200000,
            costPer1kTokens: 0.003
          }
        ]
      },
      {
        id: 'google',
        name: 'Google',
        displayName: 'Google PaLM',
        description: 'Google Generative AI models for code analysis',
        icon: '🔍',
        isActive: false,
        apiKeyRequired: true,
        configUrl: 'https://makersuite.google.com/app/apikey',
        features: ['Code Analysis', 'Best Practices'],
        supportedModels: [
          {
            id: 'gemini-pro',
            name: 'Gemini Pro',
            displayName: 'Gemini Pro',
            capabilities: [ModelCapability.CODE_REVIEW, ModelCapability.BEST_PRACTICES],
            maxTokens: 32768,
            costPer1kTokens: 0.005
          }
        ]
      }
    ];
    this.providersSubject.next(defaultProviders);
  }

  /**
   * Get all AI providers
   */
  getProviders(): Observable<AIProvider[]> {
    return this.http.get<AIProvider[]>(this.apiUrl).pipe(
      tap(providers => this.providersSubject.next(providers)),
      catchError(error => {
        console.error('Failed to fetch providers:', error);
        return this.providers$;
      })
    );
  }

  /**
   * Get provider by ID
   */
  getProvider(id: string): Observable<AIProvider> {
    return this.http.get<AIProvider>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get current selected provider
   */
  getSelectedProvider(): Observable<ProviderSelection | null> {
    return this.http.get<ProviderSelection>(`${this.apiUrl}/selected`).pipe(
      tap(selection => this.selectedProviderSubject.next(selection)),
      catchError(error => {
        console.error('Failed to fetch selected provider:', error);
        return this.selectedProvider$;
      })
    );
  }

  /**
   * Set active provider
   */
  setActiveProvider(providerId: string, modelId: string, apiKey?: string): Observable<ProviderSelection> {
    const payload = { providerId, modelId, apiKey };
    return this.http.post<ProviderSelection>(`${this.apiUrl}/select`, payload).pipe(
      tap(selection => this.selectedProviderSubject.next(selection)),
      catchError(this.handleError)
    );
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(config: ProviderConfig): Observable<ProviderConfig> {
    return this.http.put<ProviderConfig>(`${this.apiUrl}/${config.providerId}/config`, config).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get provider statistics
   */
  getProviderStats(providerId?: string): Observable<ProviderStats> {
    const url = providerId ? `${this.apiUrl}/${providerId}/stats` : `${this.apiUrl}/stats`;
    return this.http.get<ProviderStats>(url).pipe(
      tap(stats => this.statsSubject.next(stats)),
      catchError(this.handleError)
    );
  }

  /**
   * Test provider connection
   */
  testProvider(providerId: string, apiKey: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${providerId}/test`, { apiKey }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get models for a provider
   */
  getModels(providerId: string): Observable<AIModel[]> {
    return this.http.get<AIModel[]>(`${this.apiUrl}/${providerId}/models`).pipe(
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
      if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid provider configuration';
      } else if (error.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (error.status === 404) {
        errorMessage = 'Provider not found';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('AI Provider Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
