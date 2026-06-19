import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from '../../core/services/analysis.service';
import { CombinedAnalysisResponse } from '../../core/models/combined-analysis.model';
import { BugFinding, SeverityLevel } from '../../core/models/analysis.model';
import { SecurityFinding, SecuritySeverity } from '../../core/models/security.model';
import { PerformanceIssue, PerformanceSeverity } from '../../core/models/performance.model';
import { CodeQualityFinding } from '../../core/models/code-quality.model';
import { TestCase, TestPriority } from '../../core/models/test-recommendation.model';

@Component({
  selector: 'app-analysis-details',
  templateUrl: './analysis-details.component.html',
  styleUrls: ['./analysis-details.component.css']
})
export class AnalysisDetailsComponent implements OnInit, OnDestroy {
  analysisId: string | null = null;
  analysis: CombinedAnalysisResponse | null = null;
  isLoading = false;
  errorMessage = '';
  loadingMessage = 'Loading analysis details...';
  retrying = false;

  // Section expansion state
  expandedSections: Record<string, boolean> = {
    bugs: true,
    security: true,
    performance: true,
    codeQuality: true,
    tests: true
  };

  // Filters for each section
  filters = {
    bugs: { severity: 'all' },
    security: { severity: 'all' },
    performance: { severity: 'all' },
    codeQuality: { severity: 'all' },
    tests: { type: 'all', status: 'all' }
  };

  // Expandable issue cards
  expandedIssues: Set<string> = new Set();

  // Make Math available in template
  Math = Math;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private analysisService: AnalysisService
  ) {}

  ngOnInit(): void {
    this.analysisId = this.route.snapshot.paramMap.get('id');
    if (this.analysisId) {
      this.loadAnalysisDetails(this.analysisId);
    } else {
      this.loadMockAnalysis();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retryLoad(): void {
    if (!this.analysisId) {
      return;
    }
    this.retrying = true;
    this.errorMessage = '';
    this.loadingMessage = 'Retrying analysis load...';
    this.loadAnalysisDetails(this.analysisId);
  }

  private loadAnalysisDetails(analysisId: string): void {
    this.isLoading = true;
    this.loadingMessage = this.retrying ? 'Retrying analysis load...' : 'Loading analysis details...';
    this.analysisService
      .getAnalysis(analysisId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analysis) => {
          this.analysis = analysis;
          this.isLoading = false;
          this.retrying = false;
          this.loadingMessage = 'Loading analysis details...';
        },
        error: (error) => {
          console.error('Failed to load analysis:', error);
          this.errorMessage = `Failed to load analysis: ${error.message}`;
          this.isLoading = false;
          this.retrying = false;
          this.loadingMessage = 'Loading analysis details...';
          this.analysis = null;
        }
      });
  }

  private loadMockAnalysis(): void {
    // Load comprehensive mock data for all sections
    this.analysis = {
      id: this.analysisId || 'mock-001',
      repositoryId: 'repo-example',
      pullRequestId: 'pr-42',
      status: 'completed',
      analyzedAt: new Date('2026-06-16T10:30:00'),
      completedAt: new Date('2026-06-16T10:31:45'),
      findings: {
        bugs: [
          {
            id: 'bug-1', title: 'Potential SQL Injection', description: 'User input concatenated into SQL query',
            severity: SeverityLevel.CRITICAL, type: 'SECURITY', file: 'src/services/db.ts', lineNumber: 45,
            codeSnippet: 'const query = "SELECT * FROM users WHERE id = " + userId;',
            suggestion: 'Use parameterized queries: db.query("SELECT * FROM users WHERE id = ?", [userId])',
            detectedAt: new Date(), status: 'open'
          },
          {
            id: 'bug-2', title: 'Missing Error Handler', description: 'HTTP request without try-catch',
            severity: SeverityLevel.HIGH, type: 'CODE_QUALITY', file: 'src/api/client.ts', lineNumber: 56,
            codeSnippet: 'const response = await fetch(url);',
            suggestion: 'Wrap in try-catch block and handle errors',
            detectedAt: new Date(), status: 'open'
          }
        ],
        security: [
          {
            id: 'sec-1', title: 'SQL Injection in User Login', description: 'Unparameterized SQL query allows injection',
            severity: SecuritySeverity.CRITICAL, vulnerabilityType: 'SQL_INJECTION', file: 'src/auth.ts', lineNumber: 65,
            codeSnippet: 'const query = `SELECT * FROM users WHERE email = \'${email}\'`;',
            remediation: 'Use parameterized queries or prepared statements',
            cweId: '89', owasp: 'A03:2021', impactScore: 9.8, affectedSystems: ['Auth', 'DB'],
            detectedAt: new Date(), status: 'open'
          },
          {
            id: 'sec-2', title: 'Hardcoded API Key', description: 'API key exposed in source code',
            severity: SecuritySeverity.CRITICAL, vulnerabilityType: 'SENSITIVE_DATA_EXPOSURE', file: 'config.ts', lineNumber: 12,
            codeSnippet: 'const apiKey = "sk-1234567890abcdef";',
            remediation: 'Use environment variables for secrets',
            cweId: '798', owasp: 'A02:2021', impactScore: 9.9, affectedSystems: ['API'],
            detectedAt: new Date(), status: 'open'
          }
        ],
        performance: {
          issues: [
            {
              id: 'perf-1', title: 'Large Bundle Size', description: 'JS bundle exceeds recommended size',
              severity: PerformanceSeverity.HIGH, metricType: 'BUNDLE_SIZE', file: 'webpack.config.js',
              currentValue: 2.5, targetValue: 1.5, unit: 'MB', impact: 'High',
              suggestion: 'Enable code splitting and lazy loading',
              detectedAt: new Date(), status: 'open'
            }
          ],
          metrics: [
            {
              id: 'metric-1', name: 'Page Load Time', type: 'LOAD_TIME', currentValue: 3.2, previousValue: 4.1,
              targetValue: 2.0, unit: 's', threshold: 2.5, status: 'warning', trend: 'improving',
              timestamp: new Date(), historicalData: []
            }
          ]
        },
        codeQuality: [
          {
            id: 'cq-1', title: 'High Complexity', description: 'Function exceeds complexity threshold',
            severity: SeverityLevel.HIGH, category: 'COMPLEXITY', file: 'src/processor.ts', lineNumber: 118,
            codeSnippet: 'if (a) { ... } else if (b) { ... }',
            suggestion: 'Split into smaller functions',
            technicalDebtMinutes: 80, detectedAt: new Date(), status: 'open'
          }
        ],
        tests: {
          cases: [
            {
              id: 'test-1', name: 'Auth Login Happy Path', description: 'Test successful login',
              file: 'auth.spec.ts', type: 'UNIT', priority: TestPriority.CRITICAL,
              expectedBehavior: 'Should return JWT token', setupCode: 'const user = {...}',
              assertionCode: 'expect(token).toBeDefined()', estimatedMinutes: 15,
              relatedIssueIds: ['sec-1'], status: 'suggested'
            }
          ],
          recommendations: [
            {
              id: 'rec-1', title: 'Core Auth Coverage', description: 'Critical authentication tests',
              testCases: [], coverage: 72, totalLines: 245, coveredLines: 176, criticalGaps: 3,
              priority: TestPriority.CRITICAL, estimatedHours: 2.5, createdAt: new Date(), lastUpdated: new Date()
            }
          ]
        }
      },
      summary: {
        totalIssues: 6,
        criticalCount: 2,
        highCount: 2,
        mediumCount: 1,
        lowCount: 1,
        infoCount: 0,
        overallScore: 65,
        riskLevel: 'high',
        issueBreakdown: { bugs: 2, security: 2, performance: 1, codeQuality: 1, tests: 0 },
        estimatedFixTime: 540,
        technicalDebt: 720
      },
      recommendations: ['Fix SQL injection vulnerability immediately', 'Remove hardcoded API keys', 'Optimize bundle size']
    } as unknown as CombinedAnalysisResponse;
  }

  toggleSection(section: string): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  toggleIssue(issueId: string): void {
    if (this.expandedIssues.has(issueId)) {
      this.expandedIssues.delete(issueId);
    } else {
      this.expandedIssues.add(issueId);
    }
  }

  isIssueExpanded(issueId: string): boolean {
    return this.expandedIssues.has(issueId);
  }

  getFilteredBugs(): BugFinding[] {
    if (!this.analysis?.findings?.bugs) return [];
    const severity = this.filters.bugs.severity;
    if (severity === 'all') return this.analysis.findings.bugs;
    return this.analysis.findings.bugs.filter(b => b.severity === severity);
  }

  getFilteredSecurityIssues(): SecurityFinding[] {
    if (!this.analysis?.findings?.security) return [];
    const severity = this.filters.security.severity;
    if (severity === 'all') return this.analysis.findings.security;
    return this.analysis.findings.security.filter(s => s.severity === severity);
  }

  getFilteredPerformanceIssues(): PerformanceIssue[] {
    if (!this.analysis?.findings?.performance?.issues) return [];
    const severity = this.filters.performance.severity;
    if (severity === 'all') return this.analysis.findings.performance.issues;
    return this.analysis.findings.performance.issues.filter(p => p.severity === severity);
  }

  getFilteredCodeQuality(): CodeQualityFinding[] {
    if (!this.analysis?.findings?.codeQuality) return [];
    const severity = this.filters.codeQuality.severity;
    if (severity === 'all') return this.analysis.findings.codeQuality;
    return this.analysis.findings.codeQuality.filter(c => c.severity === severity);
  }

  getFilteredTests(): TestCase[] {
    if (!this.analysis?.findings?.tests?.cases) return [];
    let result = this.analysis.findings.tests.cases;
    if (this.filters.tests.type !== 'all') {
      result = result.filter(t => t.type === this.filters.tests.type);
    }
    if (this.filters.tests.status !== 'all') {
      result = result.filter(t => t.status === this.filters.tests.status);
    }
    return result;
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'severity-critical', HIGH: 'severity-high',
      MEDIUM: 'severity-medium', LOW: 'severity-low', INFO: 'severity-info'
    };
    return map[severity] || 'severity-unknown';
  }

  getSeverityIcon(severity: string): string {
    const map: Record<string, string> = {
      CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢', INFO: '🔵'
    };
    return map[severity] || '⚪';
  }

  getRiskClass(risk: string): string {
    const map: Record<string, string> = {
      critical: 'risk-critical', high: 'risk-high', medium: 'risk-medium',
      low: 'risk-low', safe: 'risk-safe'
    };
    return map[risk] || 'risk-unknown';
  }

  getRiskIcon(risk: string): string {
    const map: Record<string, string> = {
      critical: '🔴', high: '🟠', medium: '🟡', low: '🟢', safe: '✅'
    };
    return map[risk] || '⚪';
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-safe';
    if (score >= 75) return 'score-low';
    if (score >= 55) return 'score-medium';
    if (score >= 35) return 'score-high';
    return 'score-critical';
  }
}
