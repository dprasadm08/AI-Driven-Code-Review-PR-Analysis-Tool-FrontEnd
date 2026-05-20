import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Repository, 
  AddRepositoryRequest, 
  AddRepositoryResponse,
  RepositoryFilters,
  RepositoryStats 
} from '../models/repository.model';

/**
 * Repository Service - Manages repository data and API calls
 */
@Injectable({
  providedIn: 'root'
})
export class RepositoryService {
  private apiUrl = `${environment.apiUrl}/repositories`;
  private repositoriesSubject = new BehaviorSubject<Repository[]>([]);
  public repositories$ = this.repositoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all repositories
   */
  getRepositories(filters?: RepositoryFilters): Observable<Repository[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.language) params = params.set('language', filters.language);
      if (filters.searchTerm) params = params.set('search', filters.searchTerm);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<Repository[]>(this.apiUrl, { params }).pipe(
      tap(repositories => this.repositoriesSubject.next(repositories)),
      catchError(this.handleError)
    );
  }

  /**
   * Get repository by ID
   */
  getRepositoryById(id: string): Observable<Repository> {
    return this.http.get<Repository>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Add new repository
   */
  addRepository(request: AddRepositoryRequest): Observable<AddRepositoryResponse> {
    return this.http.post<AddRepositoryResponse>(this.apiUrl, request).pipe(
      tap(response => {
        // Update local repositories list
        const currentRepos = this.repositoriesSubject.value;
        this.repositoriesSubject.next([...currentRepos, response.repository]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update repository
   */
  updateRepository(id: string, updates: Partial<Repository>): Observable<Repository> {
    return this.http.put<Repository>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updatedRepo => {
        // Update local repositories list
        const currentRepos = this.repositoriesSubject.value;
        const index = currentRepos.findIndex(r => r.id === id);
        if (index !== -1) {
          currentRepos[index] = updatedRepo;
          this.repositoriesSubject.next([...currentRepos]);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete repository
   */
  deleteRepository(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remove from local repositories list
        const currentRepos = this.repositoriesSubject.value;
        this.repositoriesSubject.next(currentRepos.filter(r => r.id !== id));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Sync repository with GitHub
   */
  syncRepository(id: string): Observable<Repository> {
    return this.http.post<Repository>(`${this.apiUrl}/${id}/sync`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get repository statistics
   */
  getRepositoryStats(): Observable<RepositoryStats> {
    return this.http.get<RepositoryStats>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Validate repository URL
   */
  validateRepositoryUrl(url: string): { isValid: boolean; error?: string } {
    // GitHub URL patterns
    const githubPatterns = [
      /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/,
      /^git@github\.com:[\w-]+\/[\w.-]+\.git$/,
      /^[\w-]+\/[\w.-]+$/  // shorthand: owner/repo
    ];

    if (!url || url.trim() === '') {
      return { isValid: false, error: 'Repository URL is required' };
    }

    const trimmedUrl = url.trim();
    const isValid = githubPatterns.some(pattern => pattern.test(trimmedUrl));

    if (!isValid) {
      return { 
        isValid: false, 
        error: 'Invalid GitHub repository URL. Use format: https://github.com/owner/repo' 
      };
    }

    return { isValid: true };
  }

  /**
   * Parse GitHub URL to extract owner and repo name
   */
  parseGithubUrl(url: string): { owner: string; repo: string } | null {
    const trimmedUrl = url.trim();
    
    // Match various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\.]+)/,  // https://github.com/owner/repo
      /github\.com:([^\/]+)\/([^\.]+)/,     // git@github.com:owner/repo
      /^([^\/]+)\/([^\/]+)$/                // owner/repo
    ];

    for (const pattern of patterns) {
      const match = trimmedUrl.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '')
        };
      }
    }

    return null;
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
        errorMessage = 'Repository not found';
      } else if (error.status === 409) {
        errorMessage = 'Repository already exists';
      } else if (error.status === 422) {
        errorMessage = error.error?.message || 'Invalid repository URL';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Repository Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
