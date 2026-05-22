import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  PullRequest,
  PullRequestFilters,
  PullRequestStats,
  AIAnalysisResult,
  FetchPullRequestsResponse
} from '../models/pull-request.model';

/**
 * Pull Request Service - Manages PR data and API calls
 */
@Injectable({
  providedIn: 'root'
})
export class PullRequestService {
  private apiUrl = `${environment.apiUrl}/pull-requests`;
  private pullRequestsSubject = new BehaviorSubject<PullRequest[]>([]);
  public pullRequests$ = this.pullRequestsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Fetch pull requests from repositories
   */
  fetchPullRequests(repositoryId?: string): Observable<FetchPullRequestsResponse> {
    const params = repositoryId 
      ? new HttpParams().set('repositoryId', repositoryId)
      : new HttpParams();

    return this.http.post<FetchPullRequestsResponse>(`${this.apiUrl}/fetch`, {}, { params }).pipe(
      tap(response => {
        this.pullRequestsSubject.next(response.pullRequests);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get all pull requests with optional filters
   */
  getPullRequests(filters?: PullRequestFilters): Observable<PullRequest[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.repositoryId) params = params.set('repositoryId', filters.repositoryId);
      if (filters.state) params = params.set('state', filters.state);
      if (filters.reviewStatus) params = params.set('reviewStatus', filters.reviewStatus);
      if (filters.analysisStatus) params = params.set('analysisStatus', filters.analysisStatus);
      if (filters.author) params = params.set('author', filters.author);
      if (filters.searchTerm) params = params.set('search', filters.searchTerm);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<PullRequest[]>(this.apiUrl, { params }).pipe(
      tap(pullRequests => this.pullRequestsSubject.next(pullRequests)),
      catchError(this.handleError)
    );
  }

  /**
   * Get pull request by ID
   */
  getPullRequestById(id: string): Observable<PullRequest> {
    return this.http.get<PullRequest>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get pull requests by repository
   */
  getPullRequestsByRepository(repositoryId: string): Observable<PullRequest[]> {
    return this.http.get<PullRequest[]>(`${this.apiUrl}/repository/${repositoryId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Trigger AI analysis for a pull request
   */
  triggerAnalysis(pullRequestId: string): Observable<AIAnalysisResult> {
    return this.http.post<AIAnalysisResult>(`${this.apiUrl}/${pullRequestId}/analyze`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get AI analysis result for a pull request
   */
  getAnalysisResult(pullRequestId: string): Observable<AIAnalysisResult> {
    return this.http.get<AIAnalysisResult>(`${this.apiUrl}/${pullRequestId}/analysis`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get pull request statistics
   */
  getPullRequestStats(repositoryId?: string): Observable<PullRequestStats> {
    const params = repositoryId 
      ? new HttpParams().set('repositoryId', repositoryId)
      : new HttpParams();

    return this.http.get<PullRequestStats>(`${this.apiUrl}/stats`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sync pull requests for a specific repository
   */
  syncPullRequests(repositoryId: string): Observable<PullRequest[]> {
    return this.http.post<PullRequest[]>(`${this.apiUrl}/sync/${repositoryId}`, {}).pipe(
      tap(pullRequests => {
        const currentPRs = this.pullRequestsSubject.value;
        const updatedPRs = [
          ...currentPRs.filter(pr => pr.repositoryId !== repositoryId),
          ...pullRequests
        ];
        this.pullRequestsSubject.next(updatedPRs);
      }),
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
        errorMessage = 'Pull request not found';
      } else if (error.status === 422) {
        errorMessage = error.error?.message || 'Invalid request';
      } else if (error.status === 503) {
        errorMessage = 'Service unavailable. Please try again later.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Pull Request Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
