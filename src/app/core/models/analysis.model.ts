export enum SeverityLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum IssueType {
  BUG = 'bug',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  CODE_QUALITY = 'code-quality',
  DESIGN = 'design',
  DOCUMENTATION = 'documentation'
}

export interface BugFinding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  type: IssueType;
  file: string;
  lineNumber: number;
  codeSnippet?: string;
  suggestion?: string;
  detectedAt: Date;
  status?: 'open' | 'resolved' | 'ignored';
}

export interface AnalysisResult {
  id: string;
  pullRequestId: string;
  repositoryId: string;
  analysisDate: Date;
  totalIssuesFound: number;
  bugFindings: BugFinding[];
  severitySummary: SeveritySummary;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface SeveritySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface AnalysisStatistics {
  totalAnalyzed: number;
  totalIssuesFound: number;
  issuesByType: Record<IssueType, number>;
  issuesBySeverity: SeveritySummary;
  averageIssuesPerPR: number;
  mostCommonIssueType: IssueType;
}
