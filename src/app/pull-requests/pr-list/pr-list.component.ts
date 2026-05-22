import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PullRequestService } from '../../core/services/pull-request.service';
import { RepositoryService } from '../../core/services/repository.service';
import { 
  PullRequest, 
  PullRequestFilters, 
  PRState, 
  ReviewStatus, 
  AnalysisStatus 
} from '../../core/models/pull-request.model';
import { Repository } from '../../core/models/repository.model';

@Component({
  selector: 'app-pr-list',
  templateUrl: './pr-list.component.html',
  styleUrls: ['./pr-list.component.css']
})
export class PrListComponent implements OnInit, OnDestroy {
  pullRequests: PullRequest[] = [];
  filteredPullRequests: PullRequest[] = [];
  repositories: Repository[] = [];
  
  isLoading = false;
  isFetching = false;
  errorMessage = '';
  successMessage = '';
  
  // Filters
  searchTerm = '';
  selectedRepository = '';
  selectedState: PRState | '' = '';
  selectedReviewStatus: ReviewStatus | '' = '';
  selectedAnalysisStatus: AnalysisStatus | '' = '';
  
  private destroy$ = new Subject<void>();

  // Filter options
  stateOptions = [
    { value: '', label: 'All States' },
    { value: PRState.OPEN, label: 'Open' },
    { value: PRState.DRAFT, label: 'Draft' },
    { value: PRState.MERGED, label: 'Merged' },
    { value: PRState.CLOSED, label: 'Closed' }
  ];

  reviewOptions = [
    { value: '', label: 'All Reviews' },
    { value: ReviewStatus.PENDING, label: 'Pending' },
    { value: ReviewStatus.APPROVED, label: 'Approved' },
    { value: ReviewStatus.CHANGES_REQUESTED, label: 'Changes Requested' },
    { value: ReviewStatus.COMMENTED, label: 'Commented' }
  ];

  analysisOptions = [
    { value: '', label: 'All Analysis' },
    { value: AnalysisStatus.PENDING, label: 'Pending' },
    { value: AnalysisStatus.IN_PROGRESS, label: 'In Progress' },
    { value: AnalysisStatus.COMPLETED, label: 'Completed' },
    { value: AnalysisStatus.FAILED, label: 'Failed' }
  ];

  constructor(
    private pullRequestService: PullRequestService,
    private repositoryService: RepositoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRepositories();
    this.loadPullRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load repositories for filter dropdown
   */
  loadRepositories(): void {
    this.repositoryService.getRepositories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (repositories) => {
          this.repositories = repositories;
        },
        error: (error) => {
          console.error('Failed to load repositories:', error);
        }
      });
  }

  /**
   * Load pull requests from API
   */
  loadPullRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const filters: PullRequestFilters = this.buildFilters();

    this.pullRequestService.getPullRequests(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pullRequests) => {
          this.pullRequests = pullRequests;
          this.filteredPullRequests = pullRequests;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load pull requests';
          this.isLoading = false;
          this.pullRequests = [];
          this.filteredPullRequests = [];
        }
      });
  }

  /**
   * Fetch pull requests from GitHub
   */
  fetchPullRequests(): void {
    this.isFetching = true;
    this.errorMessage = '';
    this.successMessage = '';

    const repositoryId = this.selectedRepository || undefined;

    this.pullRequestService.fetchPullRequests(repositoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pullRequests = response.pullRequests;
          this.filteredPullRequests = response.pullRequests;
          this.isFetching = false;
          this.successMessage = `Successfully fetched ${response.total} pull requests`;
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to fetch pull requests';
          this.isFetching = false;
        }
      });
  }

  /**
   * Build filters object
   */
  private buildFilters(): PullRequestFilters {
    const filters: PullRequestFilters = {};
    
    if (this.selectedRepository) filters.repositoryId = this.selectedRepository;
    if (this.selectedState) filters.state = this.selectedState as PRState;
    if (this.selectedReviewStatus) filters.reviewStatus = this.selectedReviewStatus as ReviewStatus;
    if (this.selectedAnalysisStatus) filters.analysisStatus = this.selectedAnalysisStatus as AnalysisStatus;
    if (this.searchTerm) filters.searchTerm = this.searchTerm;

    return filters;
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    this.loadPullRequests();
  }

  /**
   * Search pull requests
   */
  onSearch(): void {
    this.loadPullRequests();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRepository = '';
    this.selectedState = '';
    this.selectedReviewStatus = '';
    this.selectedAnalysisStatus = '';
    this.loadPullRequests();
  }

  /**
   * Trigger AI analysis for a PR
   */
  triggerAnalysis(pr: PullRequest): void {
    pr.aiAnalysisStatus = AnalysisStatus.IN_PROGRESS;
    
    this.pullRequestService.triggerAnalysis(pr.id).subscribe({
      next: (result) => {
        pr.aiAnalysisStatus = AnalysisStatus.COMPLETED;
        pr.aiScore = result.score;
        this.successMessage = `Analysis completed for PR #${pr.number}`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = `Failed to analyze PR: ${error.message}`;
        pr.aiAnalysisStatus = AnalysisStatus.FAILED;
      }
    });
  }

  /**
   * View PR details
   */
  viewDetails(pr: PullRequest): void {
    this.router.navigate(['/pull-requests/details', pr.id]);
  }

  /**
   * Get state badge class
   */
  getStateClass(state: PRState): string {
    switch (state) {
      case PRState.OPEN:
        return 'state-open';
      case PRState.MERGED:
        return 'state-merged';
      case PRState.CLOSED:
        return 'state-closed';
      case PRState.DRAFT:
        return 'state-draft';
      default:
        return '';
    }
  }

  /**
   * Get review status badge class
   */
  getReviewClass(status?: ReviewStatus): string {
    switch (status) {
      case ReviewStatus.APPROVED:
        return 'review-approved';
      case ReviewStatus.CHANGES_REQUESTED:
        return 'review-changes';
      case ReviewStatus.COMMENTED:
        return 'review-commented';
      case ReviewStatus.PENDING:
        return 'review-pending';
      default:
        return 'review-none';
    }
  }

  /**
   * Get analysis status badge class
   */
  getAnalysisClass(status?: AnalysisStatus): string {
    switch (status) {
      case AnalysisStatus.COMPLETED:
        return 'analysis-completed';
      case AnalysisStatus.IN_PROGRESS:
        return 'analysis-progress';
      case AnalysisStatus.FAILED:
        return 'analysis-failed';
      case AnalysisStatus.PENDING:
        return 'analysis-pending';
      default:
        return 'analysis-none';
    }
  }

  /**
   * Get AI score color
   */
  getScoreClass(score?: number): string {
    if (!score) return '';
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  /**
   * Format date
   */
  formatDate(date?: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  /**
   * Format time ago
   */
  formatTimeAgo(date?: Date): string {
    if (!date) return 'N/A';
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}
