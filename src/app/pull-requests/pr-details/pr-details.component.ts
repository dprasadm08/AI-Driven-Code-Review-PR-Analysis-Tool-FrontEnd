import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PullRequestService } from '../../core/services/pull-request.service';
import { 
  PullRequest, 
  AIAnalysisResult, 
  PRState, 
  ReviewStatus, 
  AnalysisStatus 
} from '../../core/models/pull-request.model';

@Component({
  selector: 'app-pr-details',
  templateUrl: './pr-details.component.html',
  styleUrls: ['./pr-details.component.css']
})
export class PrDetailsComponent implements OnInit, OnDestroy {
  prId: string | null = null;
  pullRequest: PullRequest | null = null;
  analysisResult: AIAnalysisResult | null = null;
  
  isLoading = false;
  isLoadingAnalysis = false;
  isAnalyzing = false;
  errorMessage = '';
  successMessage = '';
  
  // Active tab
  activeTab: 'overview' | 'files' | 'analysis' = 'overview';
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pullRequestService: PullRequestService
  ) {}

  ngOnInit(): void {
    this.prId = this.route.snapshot.paramMap.get('id');
    if (this.prId) {
      this.loadPullRequest();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load pull request details
   */
  loadPullRequest(): void {
    if (!this.prId) return;
    
    this.isLoading = true;
    this.errorMessage = '';

    this.pullRequestService.getPullRequestById(this.prId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pr) => {
          this.pullRequest = pr;
          this.isLoading = false;
          
          // Load analysis if completed
          if (pr.aiAnalysisStatus === AnalysisStatus.COMPLETED) {
            this.loadAnalysisResult();
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load pull request details';
          this.isLoading = false;
        }
      });
  }

  /**
   * Load AI analysis result
   */
  loadAnalysisResult(): void {
    if (!this.prId) return;
    
    this.isLoadingAnalysis = true;

    this.pullRequestService.getAnalysisResult(this.prId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.analysisResult = result;
          this.isLoadingAnalysis = false;
        },
        error: (error) => {
          console.error('Failed to load analysis result:', error);
          this.isLoadingAnalysis = false;
        }
      });
  }

  /**
   * Trigger AI analysis
   */
  triggerAnalysis(): void {
    if (!this.prId || !this.pullRequest) return;
    
    this.isAnalyzing = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.pullRequest.aiAnalysisStatus = AnalysisStatus.IN_PROGRESS;

    this.pullRequestService.triggerAnalysis(this.prId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.analysisResult = result;
          if (this.pullRequest) {
            this.pullRequest.aiAnalysisStatus = AnalysisStatus.COMPLETED;
            this.pullRequest.aiScore = result.score;
          }
          this.isAnalyzing = false;
          this.successMessage = 'AI analysis completed successfully!';
          this.activeTab = 'analysis';
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to analyze pull request';
          if (this.pullRequest) {
            this.pullRequest.aiAnalysisStatus = AnalysisStatus.FAILED;
          }
          this.isAnalyzing = false;
        }
      });
  }

  /**
   * Switch tab
   */
  switchTab(tab: 'overview' | 'files' | 'analysis'): void {
    this.activeTab = tab;
  }

  /**
   * Go back to PR list
   */
  goBack(): void {
    this.router.navigate(['/pull-requests']);
  }

  /**
   * Open PR in GitHub
   */
  openInGitHub(): void {
    if (this.pullRequest?.url) {
      window.open(this.pullRequest.url, '_blank');
    }
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
   * Get severity badge class
   */
  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'severity-critical';
      case 'HIGH':
        return 'severity-high';
      case 'MEDIUM':
        return 'severity-medium';
      case 'LOW':
        return 'severity-low';
      default:
        return '';
    }
  }

  /**
   * Get priority badge class
   */
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return '';
    }
  }

  /**
   * Get suggestion type icon
   */
  getSuggestionIcon(type: string): string {
    switch (type) {
      case 'REFACTOR':
        return '🔧';
      case 'PERFORMANCE':
        return '⚡';
      case 'STYLE':
        return '🎨';
      case 'BEST_PRACTICE':
        return '✅';
      case 'DOCUMENTATION':
        return '📝';
      default:
        return '💡';
    }
  }

  /**
   * Format date
   */
  formatDate(date?: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
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

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-safe';
    if (score >= 75) return 'score-low';
    if (score >= 55) return 'score-medium';
    if (score >= 35) return 'score-high';
    return 'score-critical';
  }
}
