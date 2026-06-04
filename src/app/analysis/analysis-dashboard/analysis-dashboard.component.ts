import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PullRequestService } from '../../core/services/pull-request.service';
import { BugFinding, SeverityLevel, IssueType } from '../../core/models/analysis.model';

@Component({
  selector: 'app-analysis-dashboard',
  templateUrl: './analysis-dashboard.component.html',
  styleUrls: ['./analysis-dashboard.component.css']
})
export class AnalysisDashboardComponent implements OnInit, OnDestroy {
  analyses: any[] = [];
  bugFindings: BugFinding[] = [];
  isLoading = false;
  isBugFindingsLoading = false;
  isTriggering = false;
  errorMessage = '';
  successMessage = '';
  triggerErrorMessage = '';
  
  private destroy$ = new Subject<void>();

  constructor(private pullRequestService: PullRequestService) {}

  ngOnInit(): void {
    this.loadAnalysisShell();
    this.loadMockBugFindings();
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

  loadMockBugFindings(): void {
    this.isBugFindingsLoading = true;
    
    // Simulate API delay
    setTimeout(() => {
      // Mock data - in production, this would come from the analysis API
      this.bugFindings = [
        {
          id: '1',
          title: 'Potential SQL Injection Vulnerability',
          description: 'Database query is constructed using string concatenation without parameterized queries',
          severity: SeverityLevel.CRITICAL,
          type: IssueType.SECURITY,
          file: 'src/services/database.service.ts',
          lineNumber: 45,
          codeSnippet: 'const query = "SELECT * FROM users WHERE id = " + userId;',
          suggestion: 'Use parameterized queries: db.query("SELECT * FROM users WHERE id = ?", [userId])',
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: '2',
          title: 'Unused Variable Declaration',
          description: 'Variable "tempData" is declared but never used in the function',
          severity: SeverityLevel.LOW,
          type: IssueType.CODE_QUALITY,
          file: 'src/components/data-processor.component.ts',
          lineNumber: 23,
          codeSnippet: 'const tempData = [];',
          suggestion: 'Remove the unused variable or use it in your logic',
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: '3',
          title: 'Missing Error Boundary',
          description: 'HTTP request made without try-catch or error handler',
          severity: SeverityLevel.HIGH,
          type: IssueType.CODE_QUALITY,
          file: 'src/services/api.service.ts',
          lineNumber: 56,
          codeSnippet: 'const response = await fetch(url);',
          suggestion: 'Wrap the request in a try-catch block: try { const response = await fetch(url); } catch(error) { handleError(error); }',
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: '4',
          title: 'Performance Issue: Missing Index',
          description: 'Database query on large table without index on filtered column',
          severity: SeverityLevel.MEDIUM,
          type: IssueType.PERFORMANCE,
          file: 'src/repository/user.repository.ts',
          lineNumber: 78,
          codeSnippet: 'WHERE email = ?',
          suggestion: 'Add database index: CREATE INDEX idx_email ON users(email);',
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: '5',
          title: 'Missing Documentation',
          description: 'Public method lacks JSDoc comments describing parameters and return value',
          severity: SeverityLevel.INFO,
          type: IssueType.DOCUMENTATION,
          file: 'src/utils/validators.ts',
          lineNumber: 12,
          codeSnippet: 'public validateEmail(email: string): boolean {',
          suggestion: 'Add JSDoc: /** @param email The email string to validate @returns boolean indicating validity */',
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: '6',
          title: 'Hardcoded API URL',
          description: 'API endpoint URL is hardcoded instead of using environment configuration',
          severity: SeverityLevel.HIGH,
          type: IssueType.CODE_QUALITY,
          file: 'src/environment/config.ts',
          lineNumber: 34,
          codeSnippet: 'apiUrl: "https://api.example.com/v1"',
          suggestion: 'Use environment variables: apiUrl: environment.apiUrl',
          detectedAt: new Date(),
          status: 'open'
        }
      ];
      this.isBugFindingsLoading = false;
    }, 1000);
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
          // Reload bug findings after analysis
          setTimeout(() => {
            this.loadMockBugFindings();
            this.successMessage = '';
          }, 2000);
        },
        error: (error) => {
          this.isTriggering = false;
          this.triggerErrorMessage = error.message || 'Failed to trigger analysis. Please try again.';
        }
      });
  }
}
