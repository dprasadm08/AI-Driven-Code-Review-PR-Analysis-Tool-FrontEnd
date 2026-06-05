import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PullRequestService } from '../../core/services/pull-request.service';
import { BugFinding, SeverityLevel, IssueType } from '../../core/models/analysis.model';
import { SecurityFinding, SecuritySeverity, SecurityVulnerabilityType } from '../../core/models/security.model';

@Component({
  selector: 'app-analysis-dashboard',
  templateUrl: './analysis-dashboard.component.html',
  styleUrls: ['./analysis-dashboard.component.css']
})
export class AnalysisDashboardComponent implements OnInit, OnDestroy {
  analyses: any[] = [];
  bugFindings: BugFinding[] = [];
  securityFindings: SecurityFinding[] = [];
  isLoading = false;
  isBugFindingsLoading = false;
  isSecurityFindingsLoading = false;
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
