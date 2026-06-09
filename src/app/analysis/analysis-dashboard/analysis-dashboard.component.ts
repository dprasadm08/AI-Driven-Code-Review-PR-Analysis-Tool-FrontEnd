import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PullRequestService } from '../../core/services/pull-request.service';
import { BugFinding, SeverityLevel, IssueType } from '../../core/models/analysis.model';
import { SecurityFinding, SecuritySeverity, SecurityVulnerabilityType } from '../../core/models/security.model';
import { PerformanceIssue, PerformanceSeverity, MetricType, PerformanceMetric } from '../../core/models/performance.model';
import { CodeQualityCategory, CodeQualityFinding } from '../../core/models/code-quality.model';

@Component({
  selector: 'app-analysis-dashboard',
  templateUrl: './analysis-dashboard.component.html',
  styleUrls: ['./analysis-dashboard.component.css']
})
export class AnalysisDashboardComponent implements OnInit, OnDestroy {
  analyses: any[] = [];
  bugFindings: BugFinding[] = [];
  securityFindings: SecurityFinding[] = [];
  performanceIssues: PerformanceIssue[] = [];
  performanceMetrics: PerformanceMetric[] = [];
  codeQualityFindings: CodeQualityFinding[] = [];
  isLoading = false;
  isBugFindingsLoading = false;
  isSecurityFindingsLoading = false;
  isPerformanceLoading = false;
  isCodeQualityLoading = false;
  isTriggering = false;
  errorMessage = '';
  successMessage = '';
  triggerErrorMessage = '';
  
  private destroy$ = new Subject<void>();

  constructor(private pullRequestService: PullRequestService) {}

  ngOnInit(): void {
    this.loadAnalysisShell();
    this.loadMockBugFindings();
    this.loadMockSecurityFindings();
    this.loadMockPerformanceData();
    this.loadMockCodeQualityFindings();
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

  loadMockSecurityFindings(): void {
    this.isSecurityFindingsLoading = true;

    // Simulate API delay
    setTimeout(() => {
      // Mock security data - in production, this would come from security scan API
      this.securityFindings = [
        {
          id: 'sec-1',
          title: 'SQL Injection in User Login',
          description: 'User input directly concatenated into SQL query without parameterization, allowing SQL injection attacks',
          severity: SecuritySeverity.CRITICAL,
          vulnerabilityType: SecurityVulnerabilityType.SQL_INJECTION,
          file: 'src/services/auth.service.ts',
          lineNumber: 65,
          codeSnippet: 'const query = `SELECT * FROM users WHERE email = \'${email}\' AND password = \'${password}\'`;',
          remediation: 'Use parameterized queries or prepared statements: const user = db.query(\'SELECT * FROM users WHERE email = ? AND password = ?\', [email, hashPassword(password)]);',
          cweId: '89',
          owasp: 'A03:2021',
          impactScore: 9.8,
          affectedSystems: ['Authentication', 'User Database'],
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'sec-2',
          title: 'Cross-Site Scripting (XSS) Vulnerability',
          description: 'User input is rendered directly in HTML without sanitization, allowing XSS attacks',
          severity: SecuritySeverity.HIGH,
          vulnerabilityType: SecurityVulnerabilityType.CROSS_SITE_SCRIPTING,
          file: 'src/components/comment.component.ts',
          lineNumber: 42,
          codeSnippet: 'this.commentHtml = this.userComment;',
          remediation: 'Use Angular\'s built-in sanitization or the DomSanitizer: this.sanitizer.sanitize(SecurityContext.HTML, userComment)',
          cweId: '79',
          owasp: 'A03:2021',
          impactScore: 8.5,
          affectedSystems: ['User Interface', 'Frontend'],
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'sec-3',
          title: 'Hardcoded API Key in Source Code',
          description: 'API key exposed in plain text within the source code, allowing unauthorized API access',
          severity: SecuritySeverity.CRITICAL,
          vulnerabilityType: SecurityVulnerabilityType.SENSITIVE_DATA_EXPOSURE,
          file: 'src/environment/config.ts',
          lineNumber: 12,
          codeSnippet: 'apiKey: "sk-1234567890abcdef"',
          remediation: 'Move secrets to environment variables: const apiKey = process.env.API_KEY;',
          cweId: '798',
          owasp: 'A02:2021',
          impactScore: 9.9,
          affectedSystems: ['API Integration', 'Third-party Services'],
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'sec-4',
          title: 'Weak Password Hashing Algorithm',
          description: 'Passwords are hashed using MD5, which is cryptographically broken and should not be used',
          severity: SecuritySeverity.HIGH,
          vulnerabilityType: SecurityVulnerabilityType.WEAK_CRYPTOGRAPHY,
          file: 'src/services/auth.service.ts',
          lineNumber: 88,
          codeSnippet: 'const hashedPassword = md5(password);',
          remediation: 'Use bcrypt or argon2: const hashedPassword = await bcrypt.hash(password, 10);',
          cweId: '327',
          owasp: 'A02:2021',
          impactScore: 8.2,
          affectedSystems: ['Authentication', 'Password Storage'],
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'sec-5',
          title: 'Missing CORS Validation',
          description: 'CORS allows requests from any origin without validation, enabling unauthorized cross-origin attacks',
          severity: SecuritySeverity.MEDIUM,
          vulnerabilityType: SecurityVulnerabilityType.BROKEN_ACCESS_CONTROL,
          file: 'src/server/middleware/cors.ts',
          lineNumber: 5,
          codeSnippet: 'app.use(cors()); // No whitelist defined',
          remediation: 'Restrict CORS to specific origins: app.use(cors({ origin: "https://trusted-domain.com" }));',
          cweId: '942',
          owasp: 'A01:2021',
          impactScore: 6.5,
          affectedSystems: ['API', 'Frontend-Backend Communication'],
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'sec-6',
          title: 'Insufficient Logging of Security Events',
          description: 'Failed authentication attempts and sensitive operations are not logged, hindering security monitoring',
          severity: SecuritySeverity.MEDIUM,
          vulnerabilityType: SecurityVulnerabilityType.INSUFFICIENT_LOGGING,
          file: 'src/services/auth.service.ts',
          lineNumber: 75,
          codeSnippet: 'if (!user) { return null; } // No logging of failed attempt',
          remediation: 'Log security events: logger.warn(`Failed login attempt for ${email} from ${ip}`);',
          cweId: '778',
          owasp: 'A09:2021',
          impactScore: 5.3,
          affectedSystems: ['Authentication', 'Security Monitoring'],
          detectedAt: new Date(),
          status: 'open'
        }
      ];
      this.isSecurityFindingsLoading = false;
    }, 1200);
  }

  loadMockPerformanceData(): void {
    this.isPerformanceLoading = true;

    // Simulate API delay
    setTimeout(() => {
      // Mock performance issues
      this.performanceIssues = [
        {
          id: 'perf-1',
          title: 'Large Bundle Size',
          description: 'JavaScript bundle size exceeds recommended threshold, impacting initial load time',
          severity: PerformanceSeverity.HIGH,
          metricType: MetricType.BUNDLE_SIZE,
          file: 'webpack.config.js',
          currentValue: 2.5,
          targetValue: 1.5,
          unit: 'MB',
          impact: 'High',
          suggestion: 'Enable code splitting, lazy load routes, and remove unused dependencies. Consider using dynamic imports for large features.',
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'perf-2',
          title: 'Slow API Response Time',
          description: 'Backend API responds slowly for complex queries, degrading user experience',
          severity: PerformanceSeverity.CRITICAL,
          metricType: MetricType.API_RESPONSE,
          file: 'src/services/data.service.ts',
          lineNumber: 45,
          currentValue: 3500,
          targetValue: 1000,
          unit: 'ms',
          impact: 'Critical',
          suggestion: 'Optimize database queries, add caching layer (Redis), implement pagination, and consider GraphQL for selective field fetching.',
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'perf-3',
          title: 'High Memory Usage',
          description: 'Application consuming excessive memory, especially on mobile devices',
          severity: PerformanceSeverity.HIGH,
          metricType: MetricType.MEMORY,
          file: 'src/store/state.ts',
          lineNumber: 12,
          currentValue: 450,
          targetValue: 250,
          unit: 'MB',
          impact: 'High',
          suggestion: 'Review store management, implement virtual scrolling for lists, unsubscribe from observables properly, and optimize images.',
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'perf-4',
          title: 'Slow Component Render Time',
          description: 'Dashboard component takes too long to render with large datasets',
          severity: PerformanceSeverity.MEDIUM,
          metricType: MetricType.RENDER_TIME,
          file: 'src/components/dashboard.component.ts',
          lineNumber: 80,
          currentValue: 850,
          targetValue: 300,
          unit: 'ms',
          impact: 'Medium',
          suggestion: 'Use OnPush change detection strategy, implement trackBy in *ngFor, use async pipe with observables.',
          detectedAt: new Date(),
          status: 'acknowledged'
        },
        {
          id: 'perf-5',
          title: 'Missing Image Optimization',
          description: 'Images not optimized and served at full resolution, consuming bandwidth unnecessarily',
          severity: PerformanceSeverity.MEDIUM,
          metricType: MetricType.NETWORK,
          currentValue: 15,
          targetValue: 3,
          unit: 'MB',
          impact: 'Medium',
          suggestion: 'Implement lazy loading, use WebP format with fallbacks, serve responsive images with srcset, and compress all images.',
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'perf-6',
          title: 'Database Query N+1 Problem',
          description: 'Multiple database queries issued in loops instead of batch operations',
          severity: PerformanceSeverity.HIGH,
          metricType: MetricType.DATABASE,
          file: 'src/repository/user.repository.ts',
          lineNumber: 120,
          currentValue: 150,
          targetValue: 5,
          unit: 'queries',
          impact: 'High',
          suggestion: 'Use JOIN queries or implement eager loading, batch database operations, and add query caching mechanisms.',
          detectedAt: new Date(),
          status: 'open'
        }
      ];

      // Mock performance metrics
      this.performanceMetrics = [
        {
          id: 'metric-1',
          name: 'Page Load Time',
          type: MetricType.LOAD_TIME,
          currentValue: 3.2,
          previousValue: 4.1,
          targetValue: 2.0,
          unit: 's',
          threshold: 2.5,
          status: 'warning',
          trend: 'improving',
          timestamp: new Date(),
          historicalData: []
        },
        {
          id: 'metric-2',
          name: 'Core Web Vitals - LCP',
          type: MetricType.LOAD_TIME,
          currentValue: 2.8,
          previousValue: 3.1,
          targetValue: 2.5,
          unit: 's',
          threshold: 2.5,
          status: 'critical',
          trend: 'stable',
          timestamp: new Date(),
          historicalData: []
        },
        {
          id: 'metric-3',
          name: 'API Throughput',
          type: MetricType.THROUGHPUT,
          currentValue: 450,
          previousValue: 420,
          targetValue: 500,
          unit: 'req/s',
          threshold: 400,
          status: 'healthy',
          trend: 'improving',
          timestamp: new Date(),
          historicalData: []
        },
        {
          id: 'metric-4',
          name: 'CPU Usage',
          type: MetricType.CPU,
          currentValue: 62,
          previousValue: 71,
          targetValue: 50,
          unit: '%',
          threshold: 75,
          status: 'warning',
          trend: 'improving',
          timestamp: new Date(),
          historicalData: []
        },
        {
          id: 'metric-5',
          name: 'Memory Consumption',
          type: MetricType.MEMORY,
          currentValue: 68,
          previousValue: 75,
          targetValue: 50,
          unit: '%',
          threshold: 80,
          status: 'warning',
          trend: 'improving',
          timestamp: new Date(),
          historicalData: []
        },
        {
          id: 'metric-6',
          name: 'Network Bandwidth',
          type: MetricType.NETWORK,
          currentValue: 18.5,
          previousValue: 22.3,
          targetValue: 10.0,
          unit: 'Mbps',
          threshold: 25,
          status: 'warning',
          trend: 'improving',
          timestamp: new Date(),
          historicalData: []
        }
      ];

      this.isPerformanceLoading = false;
    }, 1300);
  }

  loadMockCodeQualityFindings(): void {
    this.isCodeQualityLoading = true;

    setTimeout(() => {
      this.codeQualityFindings = [
        {
          id: 'cq-1',
          title: 'Function Exceeds Complexity Threshold',
          description: 'Method contains too many nested branches, making it difficult to test and maintain.',
          severity: SeverityLevel.HIGH,
          category: CodeQualityCategory.COMPLEXITY,
          file: 'src/app/services/pull-request.service.ts',
          lineNumber: 118,
          codeSnippet: 'if (a) { ... } else if (b) { ... } else if (c) { ... }',
          suggestion: 'Split logic into smaller private methods and use guard clauses to reduce branching.',
          technicalDebtMinutes: 80,
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'cq-2',
          title: 'Duplicated Validation Logic',
          description: 'Validation rules are repeated across multiple components instead of shared utilities.',
          severity: SeverityLevel.MEDIUM,
          category: CodeQualityCategory.MAINTAINABILITY,
          file: 'src/app/repositories/repository-create/repository-create.component.ts',
          lineNumber: 52,
          codeSnippet: 'if (!url || url.length < 10) { ... }',
          suggestion: 'Extract common rules into a shared validator service and reuse across forms.',
          technicalDebtMinutes: 45,
          detectedAt: new Date(),
          status: 'reviewing'
        },
        {
          id: 'cq-3',
          title: 'Insufficient Unit Test Coverage',
          description: 'Critical service methods are not covered by unit tests, increasing regression risk.',
          severity: SeverityLevel.HIGH,
          category: CodeQualityCategory.TESTING,
          file: 'src/app/core/services/auth.service.ts',
          suggestion: 'Add unit tests for login, refresh token, and logout flows with edge cases.',
          technicalDebtMinutes: 120,
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'cq-4',
          title: 'Ambiguous Variable Names',
          description: 'Generic names like data, temp, and obj reduce readability for future contributors.',
          severity: SeverityLevel.LOW,
          category: CodeQualityCategory.READABILITY,
          file: 'src/app/analysis/analysis-history/analysis-history.component.ts',
          lineNumber: 37,
          codeSnippet: 'const data = this.items.map((obj) => ...);',
          suggestion: 'Rename variables to domain-specific names that communicate intent clearly.',
          technicalDebtMinutes: 20,
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'cq-5',
          title: 'Direct Subscription Without Cleanup',
          description: 'Observable subscription is created without teardown logic in a long-lived component.',
          severity: SeverityLevel.CRITICAL,
          category: CodeQualityCategory.RELIABILITY,
          file: 'src/app/analysis/analysis-details/analysis-details.component.ts',
          lineNumber: 64,
          codeSnippet: 'this.prService.getDetails().subscribe((result) => { ... });',
          suggestion: 'Use takeUntil(this.destroy$) or async pipe to prevent memory leaks.',
          technicalDebtMinutes: 60,
          detectedAt: new Date(),
          status: 'open'
        },
        {
          id: 'cq-6',
          title: 'Missing Error Context in Logging',
          description: 'Error logs are written without request metadata, making incidents harder to debug.',
          severity: SeverityLevel.MEDIUM,
          category: CodeQualityCategory.BEST_PRACTICES,
          file: 'src/app/core/interceptors/error.interceptor.ts',
          lineNumber: 29,
          codeSnippet: 'console.error(error);',
          suggestion: 'Log structured context such as request URL, correlation ID, and user action.',
          technicalDebtMinutes: 30,
          detectedAt: new Date(),
          status: 'refactored'
        }
      ];

      this.isCodeQualityLoading = false;
    }, 1100);
  }

  triggerAnalysis(): void {
    this.isTriggering = true;
    this.triggerErrorMessage = '';
    this.successMessage = '';

    this.pullRequestService.triggerAnalysis('latest-pr')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isTriggering = false;
          this.successMessage = 'Analysis triggered successfully! Processing your code reviews...';

          setTimeout(() => {
            this.loadMockBugFindings();
            this.loadMockSecurityFindings();
            this.loadMockPerformanceData();
            this.loadMockCodeQualityFindings();
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
