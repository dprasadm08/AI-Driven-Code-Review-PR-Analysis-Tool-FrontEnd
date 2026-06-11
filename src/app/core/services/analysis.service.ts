import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CombinedAnalysisRequest,
  CombinedAnalysisResponse,
  AnalysisTriggerRequest,
  AnalysisTriggerResponse,
  AnalysisHistory
} from '../models/combined-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private apiUrl = `${environment.apiUrl}/api/analysis`;
  private currentAnalysis$ = new BehaviorSubject<CombinedAnalysisResponse | null>(null);
  private analysisHistory$ = new BehaviorSubject<AnalysisHistory[]>([]);
  private isAnalyzing$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  /**
   * Get combined analysis for a specific pull request
   */
  getAnalysis(analysisId: string): Observable<CombinedAnalysisResponse> {
    return this.http
      .get<CombinedAnalysisResponse>(`${this.apiUrl}/${analysisId}`)
      .pipe(
        retry(1),
        tap((response) => this.currentAnalysis$.next(response)),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Get analysis for a pull request with filtering options
   */
  getAnalysisByPullRequest(
    repositoryId: string,
    pullRequestId: string,
    analysisTypes?: string[]
  ): Observable<CombinedAnalysisResponse> {
    let params = new HttpParams();
    params = params.set('repositoryId', repositoryId);
    params = params.set('pullRequestId', pullRequestId);

    if (analysisTypes && analysisTypes.length > 0) {
      params = params.set('types', analysisTypes.join(','));
    }

    return this.http
      .get<CombinedAnalysisResponse>(`${this.apiUrl}/pull-request`, { params })
      .pipe(
        retry(1),
        tap((response) => this.currentAnalysis$.next(response)),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Trigger a new analysis on the backend
   */
  triggerAnalysis(request: AnalysisTriggerRequest): Observable<AnalysisTriggerResponse> {
    this.isAnalyzing$.next(true);
    return this.http
      .post<AnalysisTriggerResponse>(`${this.apiUrl}/trigger`, request)
      .pipe(
        tap((response) => {
          console.log('Analysis triggered successfully:', response);
        }),
        catchError((error) => {
          this.isAnalyzing$.next(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get analysis history for a repository
   */
  getAnalysisHistory(
    repositoryId: string,
    limit: number = 10,
    offset: number = 0
  ): Observable<AnalysisHistory[]> {
    let params = new HttpParams();
    params = params.set('limit', limit.toString());
    params = params.set('offset', offset.toString());

    return this.http
      .get<AnalysisHistory[]>(`${this.apiUrl}/repository/${repositoryId}/history`, { params })
      .pipe(
        retry(1),
        tap((history) => this.analysisHistory$.next(history)),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Get recent analyses across all repositories
   */
  getRecentAnalyses(limit: number = 20): Observable<AnalysisHistory[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http
      .get<AnalysisHistory[]>(`${this.apiUrl}/recent`, { params })
      .pipe(
        retry(1),
        tap((history) => this.analysisHistory$.next(history)),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Get analysis details by type
   */
  getAnalysisDetails(
    analysisId: string,
    analysisType: 'bugs' | 'security' | 'performance' | 'code-quality' | 'tests'
  ): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${analysisId}/${analysisType}`)
      .pipe(
        retry(1),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Export analysis results
   */
  exportAnalysis(analysisId: string, format: 'json' | 'pdf' | 'csv'): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/${analysisId}/export?format=${format}`, {
        responseType: 'blob'
      })
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Check analysis status
   */
  checkAnalysisStatus(analysisId: string): Observable<{ status: string; progress: number }> {
    return this.http
      .get<{ status: string; progress: number }>(`${this.apiUrl}/${analysisId}/status`)
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Get current analysis observable
   */
  getCurrentAnalysis(): Observable<CombinedAnalysisResponse | null> {
    return this.currentAnalysis$.asObservable();
  }

  /**
   * Get analysis history observable
   */
  getAnalysisHistoryObservable(): Observable<AnalysisHistory[]> {
    return this.analysisHistory$.asObservable();
  }

  /**
   * Get is analyzing observable
   */
  getIsAnalyzing(): Observable<boolean> {
    return this.isAnalyzing$.asObservable();
  }

  /**
   * Set is analyzing state
   */
  setIsAnalyzing(value: boolean): void {
    this.isAnalyzing$.next(value);
  }

  /**
   * Poll for analysis completion
   */
  pollAnalysisStatus(analysisId: string, maxAttempts: number = 60, interval: number = 1000): Observable<CombinedAnalysisResponse> {
    return new Observable((observer) => {
      let attempts = 0;

      const poll = () => {
        this.getAnalysis(analysisId).subscribe(
          (response) => {
            if (response.status === 'completed' || response.status === 'failed') {
              this.isAnalyzing$.next(false);
              observer.next(response);
              observer.complete();
            } else if (attempts >= maxAttempts) {
              this.isAnalyzing$.next(false);
              observer.error(new Error('Analysis polling timeout'));
            } else {
              attempts++;
              setTimeout(poll, interval);
            }
          },
          (error) => {
            observer.error(error);
          }
        );
      };

      poll();
    });
  }

  /**
   * Calculate risk level based on issues
   */
  calculateRiskLevel(
    criticalCount: number,
    highCount: number,
    mediumCount: number
  ): 'critical' | 'high' | 'medium' | 'low' | 'safe' {
    if (criticalCount > 0) return 'critical';
    if (highCount >= 3) return 'high';
    if (highCount > 0 || mediumCount >= 5) return 'medium';
    if (mediumCount > 0) return 'low';
    return 'safe';
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any) {
    let errorMessage = 'An error occurred during analysis';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 404) {
      errorMessage = 'Analysis not found';
    } else if (error.status === 400) {
      errorMessage = `Bad request: ${error.error.message || 'Invalid parameters'}`;
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized: Please log in again';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden: You do not have permission to access this analysis';
    } else if (error.status === 429) {
      errorMessage = 'Too many requests: Please wait before trying again';
    } else if (error.status === 500) {
      errorMessage = 'Server error: Please try again later';
    } else if (error.status === 0) {
      errorMessage = 'Network error: Check your connection';
    }

    console.error('Analysis Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
