import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PullRequestService } from '../../core/services/pull-request.service';

@Component({
  selector: 'app-analysis-dashboard',
  templateUrl: './analysis-dashboard.component.html',
  styleUrls: ['./analysis-dashboard.component.css']
})
export class AnalysisDashboardComponent implements OnInit, OnDestroy {
  analyses: any[] = [];
  isLoading = false;
  isTriggering = false;
  errorMessage = '';
  successMessage = '';
  triggerErrorMessage = '';
  
  private destroy$ = new Subject<void>();

  constructor(private pullRequestService: PullRequestService) {}

  ngOnInit(): void {
    this.loadAnalysisShell();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalysisShell(): void {
    this.isLoading = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.analyses = [];
  }

  triggerAnalysis(): void {
    this.isTriggering = true;
    this.triggerErrorMessage = '';
    this.successMessage = '';

    // Placeholder API call - in production, this would trigger analysis for selected PRs
    // For now, we'll simulate a bulk analysis trigger
    this.pullRequestService.triggerAnalysis('latest-pr')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.isTriggering = false;
          this.successMessage = 'Analysis triggered successfully! Processing your code reviews...';
          setTimeout(() => {
            this.successMessage = '';
          }, 4000);
        },
        error: (error) => {
          this.isTriggering = false;
          this.triggerErrorMessage = error.message || 'Failed to trigger analysis. Please try again.';
        }
      });
  }
}
