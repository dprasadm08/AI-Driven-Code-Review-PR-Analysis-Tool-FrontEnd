import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from '../../core/services/analysis.service';
import { BugFinding, SeverityLevel, IssueType } from '../../core/models/analysis.model';
import { SecurityFinding, SecuritySeverity, SecurityVulnerabilityType } from '../../core/models/security.model';
import { PerformanceIssue, PerformanceSeverity, MetricType, PerformanceMetric } from '../../core/models/performance.model';
import { CodeQualityCategory, CodeQualityFinding } from '../../core/models/code-quality.model';
import { TestCase, TestType, TestPriority, TestRecommendation } from '../../core/models/test-recommendation.model';
import { CombinedAnalysisResponse, AnalysisTriggerRequest } from '../../core/models/combined-analysis.model';

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
  testCases: TestCase[] = [];
  testRecommendations: TestRecommendation[] = [];
  isLoading = false;
  isBugFindingsLoading = false;
  isSecurityFindingsLoading = false;
  isPerformanceLoading = false;
  isCodeQualityLoading = false;
  isTestRecommendationsLoading = false;
  isTriggering = false;
  errorMessage = '';
  successMessage = '';
  triggerErrorMessage = '';
  currentAnalysis: CombinedAnalysisResponse | null = null;
  analysisId: string = '';
  repositoryId: string = '';
  pullRequestId: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private analysisService: AnalysisService
  ) {}

  ngOnInit(): void {
    this.loadAnalysisShell();
    this.initializeDashboard();
    this.subscribeToAnalysisState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the dashboard by loading analysis data
   */
  private initializeDashboard(): void {
    // Try to get analysis ID from route params or URL
    this.extractAnalysisParameters();
    
    if (this.analysisId) {
      // Load existing analysis
      this.loadAnalysisById(this.analysisId);
    } else {
      // Load mock data as fallback
      this.loadMockData();
    }
  }

  /**
   * Extract analysis parameters from route or other sources
   */
  private extractAnalysisParameters(): void {
    // This would typically come from ActivatedRoute params
    // For now, using fallback values
    const params = this.getUrlParams();
    this.analysisId = params['analysisId'] || '';
    this.repositoryId = params['repositoryId'] || 'default-repo';
    this.pullRequestId = params['pullRequestId'] || 'latest-pr';
  }

  /**
   * Get URL parameters
   */
  private getUrlParams(): any {
    const params: any = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;
    while ((m = regex.exec(queryString))) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
  }

  /**
   * Subscribe to analysis service state changes
   */
  private subscribeToAnalysisState(): void {
    this.analysisService
      .getCurrentAnalysis()
      .pipe(takeUntil(this.destroy$))
      .subscribe((analysis) => {
        if (analysis) {
          this.currentAnalysis = analysis;
          this.populateAnalysisData(analysis);
        }
      });

    this.analysisService
      .getIsAnalyzing()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAnalyzing) => {
        this.isTriggering = isAnalyzing;
      });
  }

  /**
   * Load analysis by ID from API
   */
  private loadAnalysisById(analysisId: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.analysisService
      .getAnalysis(analysisId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analysis) => {
          this.currentAnalysis = analysis;
          this.populateAnalysisData(analysis);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load analysis:', error);
          this.errorMessage = `Failed to load analysis: ${error.message}`;
          this.isLoading = false;
          // Fallback to mock data
          this.loadMockData();
        }
      });
  }

  /**
   * Populate analysis data from API response
   */
  private populateAnalysisData(analysis: CombinedAnalysisResponse): void {
    if (analysis.findings) {
      this.bugFindings = analysis.findings.bugs || [];
      this.securityFindings = analysis.findings.security || [];
      this.performanceIssues = analysis.findings.performance?.issues || [];
      this.performanceMetrics = analysis.findings.performance?.metrics || [];
      this.codeQualityFindings = analysis.findings.codeQuality || [];
      this.testCases = analysis.findings.tests?.cases || [];
      this.testRecommendations = analysis.findings.tests?.recommendations || [];
    }

    if (analysis.status === 'completed') {
      this.successMessage = `Analysis completed at ${new Date(analysis.completedAt!).toLocaleString()}`;
    } else if (analysis.status === 'failed') {
      this.errorMessage = `Analysis failed: ${analysis.errorMessage || 'Unknown error'}`;
    }
  }

  /**
   * Load mock data as fallback
   */
  private loadMockData(): void {
    this.loadMockBugFindings();
    this.loadMockSecurityFindings();
    this.loadMockPerformanceData();
    this.loadMockCodeQualityFindings();
    this.loadMockTestRecommendations();
  }

  loadAnalysisShell(): void {
    this.isLoading = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.triggerErrorMessage = '';
    this.analyses = [];
  }

  dismissSuccessMessage(): void {
    this.successMessage = '';
  }

  dismissErrorMessage(): void {
    this.triggerErrorMessage = '';
  }

  getAutoAnalysisStatusLabel(): string {
    if (this.isTriggering) {
      return 'In Progress';
    }

    const status = this.currentAnalysis?.status;
    if (status === 'completed') {
      return 'Healthy';
    }
    if (status === 'failed') {
      return 'Action Needed';
    }
    if (status === 'pending' || status === 'in-progress') {
      return 'In Progress';
    }

    return 'Idle';
  }

  getAutoAnalysisStatusClass(): string {
    if (this.isTriggering) {
      return 'status-running';
    }

    const status = this.currentAnalysis?.status;
    if (status === 'completed') {
      return 'status-healthy';
    }
    if (status === 'failed') {
      return 'status-failed';
    }
    if (status === 'pending' || status === 'in-progress') {
      return 'status-running';
    }

    return 'status-idle';
  }

  getAutoAnalysisStatusIcon(): string {
    if (this.isTriggering) {
      return '⏳';
    }

    const status = this.currentAnalysis?.status;
    if (status === 'completed') {
      return '✅';
    }
    if (status === 'failed') {
      return '⚠️';
    }
    if (status === 'pending' || status === 'in-progress') {
      return '⏳';
    }

    return '🟡';
  }

  getLastAutoAnalysisText(): string {
    const completedAt = this.currentAnalysis?.completedAt;
    const analyzedAt = this.currentAnalysis?.analyzedAt;
    const timestamp = completedAt || analyzedAt;

    if (!timestamp) {
      return 'Last run: Not available yet';
    }

    return `Last run: ${new Date(timestamp).toLocaleString()}`;
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
          file: 'src/assets/images',
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

  loadMockTestRecommendations(): void {
    this.isTestRecommendationsLoading = true;

    setTimeout(() => {
      this.testCases = [
        {
          id: 'test-1',
          name: 'Auth Service Login Happy Path',
          description: 'Test successful user login with valid credentials',
          file: 'src/app/core/services/auth.service.spec.ts',
          type: TestType.UNIT,
          priority: TestPriority.CRITICAL,
          expectedBehavior: 'Should authenticate user and return JWT token with valid credentials',
          setupCode: 'const mockUser = { email: "test@example.com", password: "secure123" };',
          assertionCode: 'expect(result.token).toBeDefined(); expect(result.user.id).toBe(mockUser.id);',
          estimatedMinutes: 15,
          relatedIssueIds: ['sec-1', 'cq-5'],
          status: 'suggested'
        },
        {
          id: 'test-2',
          name: 'Auth Service Invalid Credentials',
          description: 'Test login failure with incorrect password',
          file: 'src/app/core/services/auth.service.spec.ts',
          type: TestType.UNIT,
          priority: TestPriority.HIGH,
          expectedBehavior: 'Should throw authentication error and not create session',
          setupCode: 'const mockUser = { email: "test@example.com", password: "wrong" };',
          assertionCode: 'expect(() => authService.login(mockUser)).toThrowError("Invalid credentials");',
          estimatedMinutes: 10,
          relatedIssueIds: ['sec-1'],
          status: 'suggested'
        },
        {
          id: 'test-3',
          name: 'Token Refresh Flow Integration',
          description: 'Test automatic token refresh when expired',
          file: 'src/app/core/interceptors/auth.interceptor.spec.ts',
          type: TestType.INTEGRATION,
          priority: TestPriority.CRITICAL,
          expectedBehavior: 'Should intercept 401 response and refresh token automatically',
          setupCode: 'const expiredToken = generateExpiredJWT(); httpClient.get(url).subscribe();',
          assertionCode: 'expect(refreshTokenCalls).toBe(1); expect(retryCount).toBe(1);',
          estimatedMinutes: 25,
          relatedIssueIds: [],
          status: 'suggested'
        },
        {
          id: 'test-4',
          name: 'Performance: Bundle Size Reduction',
          description: 'Test code splitting and lazy loading effectiveness',
          file: 'src/app/analysis/test-setup.ts',
          type: TestType.PERFORMANCE,
          priority: TestPriority.HIGH,
          expectedBehavior: 'Main bundle should be under 1.5MB and lazy modules under 500KB',
          setupCode: 'const bundleSize = measureBundleSize();',
          assertionCode: 'expect(bundleSize.main).toBeLessThan(1500); expect(bundleSize.lazy).toBeLessThan(500);',
          estimatedMinutes: 30,
          relatedIssueIds: ['perf-1'],
          status: 'suggested'
        },
        {
          id: 'test-5',
          name: 'XSS Vulnerability Prevention',
          description: 'Verify user input sanitization in comment component',
          file: 'src/app/components/comment.component.spec.ts',
          type: TestType.SECURITY,
          priority: TestPriority.CRITICAL,
          expectedBehavior: 'HTML and script tags should be escaped or removed from rendered output',
          setupCode: 'const maliciousInput = "<script>alert(\'xss\')</script>";',
          assertionCode: 'expect(renderedElement.textContent).not.toContain("<script>"); expect(sanitizationCalls).toBe(1);',
          estimatedMinutes: 20,
          relatedIssueIds: ['sec-2'],
          status: 'in-progress'
        },
        {
          id: 'test-6',
          name: 'Analysis Dashboard Rendering',
          description: 'Test end-to-end dashboard rendering with large dataset',
          file: 'src/app/analysis/analysis-dashboard/analysis-dashboard.e2e.ts',
          type: TestType.E2E,
          priority: TestPriority.MEDIUM,
          expectedBehavior: 'Dashboard should render all sections within 3 seconds with 1000 items',
          setupCode: 'loadFixture("dashboard-1000-items.json"); navigateTo("/analysis");',
          assertionCode: 'expect(renderTime).toBeLessThan(3000); expect(visibleElements).toBe(allElements);',
          estimatedMinutes: 45,
          relatedIssueIds: ['perf-4'],
          status: 'suggested'
        }
      ];

      this.testRecommendations = [
        {
          id: 'rec-1',
          title: 'Core Module Coverage',
          description: 'Authentication and HTTP interceptor critical path coverage',
          testCases: this.testCases.filter((tc) => ['test-1', 'test-2', 'test-3'].includes(tc.id)),
          coverage: 72,
          totalLines: 245,
          coveredLines: 176,
          criticalGaps: 3,
          priority: TestPriority.CRITICAL,
          estimatedHours: 2.5,
          createdAt: new Date(),
          lastUpdated: new Date()
        },
        {
          id: 'rec-2',
          title: 'Security Vulnerability Prevention',
          description: 'Security-focused test recommendations from PR analysis',
          testCases: this.testCases.filter((tc) => tc.type === TestType.SECURITY),
          coverage: 65,
          totalLines: 180,
          coveredLines: 117,
          criticalGaps: 2,
          priority: TestPriority.CRITICAL,
          estimatedHours: 1.5,
          createdAt: new Date(),
          lastUpdated: new Date()
        }
      ];

      this.isTestRecommendationsLoading = false;
    }, 1200);
  }

  /**
   * Trigger a new analysis on the backend
   */
  triggerAnalysis(): void {
    this.isTriggering = true;
    this.triggerErrorMessage = '';
    this.successMessage = '';
    this.analysisService.setIsAnalyzing(true);

    const request: AnalysisTriggerRequest = {
      repositoryId: this.repositoryId,
      pullRequestId: this.pullRequestId || undefined,
      analysisType: 'full',
      priority: 'high'
    };

    this.analysisService
      .triggerAnalysis(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMessage = `Analysis triggered successfully! Estimated duration: ${response.estimatedDuration}s`;
          this.analysisId = response.analysisId;
          this.pollAnalysisCompletion(response.analysisId);
        },
        error: (error) => {
          this.isTriggering = false;
          this.analysisService.setIsAnalyzing(false);
          this.triggerErrorMessage = error.message || 'Failed to trigger analysis. Please try again.';
          console.error('Analysis trigger error:', error);
          // Reload mock data as fallback
          setTimeout(() => {
            this.loadMockData();
          }, 1000);
        }
      });
  }

  /**
   * Poll for analysis completion
   */
  private pollAnalysisCompletion(analysisId: string): void {
    this.analysisService
      .pollAnalysisStatus(analysisId, 60, 2000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analysis) => {
          this.currentAnalysis = analysis;
          this.populateAnalysisData(analysis);
          this.isTriggering = false;
          this.successMessage = `Analysis completed successfully!`;
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (error) => {
          this.isTriggering = false;
          this.analysisService.setIsAnalyzing(false);
          this.triggerErrorMessage = `Analysis polling error: ${error.message}`;
          console.error('Analysis polling error:', error);
          // Reload mock data as fallback
          this.loadMockData();
        }
      });
  }
}
