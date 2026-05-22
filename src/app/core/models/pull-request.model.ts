/**
 * Pull Request model interface
 */
export interface PullRequest {
  id: string;
  number: number;
  title: string;
  description?: string;
  state: PRState;
  author: string;
  authorAvatar?: string;
  repositoryId: string;
  repositoryName: string;
  repositoryOwner: string;
  sourceBranch: string;
  targetBranch: string;
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  closedAt?: Date;
  url: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  comments: number;
  reviewStatus?: ReviewStatus;
  aiAnalysisStatus?: AnalysisStatus;
  aiScore?: number;
  labels?: string[];
  assignees?: string[];
}

/**
 * Pull Request state enum
 */
export enum PRState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  MERGED = 'MERGED',
  DRAFT = 'DRAFT'
}

/**
 * Review status enum
 */
export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  COMMENTED = 'COMMENTED'
}

/**
 * AI Analysis status enum
 */
export enum AnalysisStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Pull Request filters
 */
export interface PullRequestFilters {
  repositoryId?: string;
  state?: PRState;
  reviewStatus?: ReviewStatus;
  analysisStatus?: AnalysisStatus;
  author?: string;
  searchTerm?: string;
  sortBy?: 'created' | 'updated' | 'number' | 'aiScore';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pull Request statistics
 */
export interface PullRequestStats {
  totalPRs: number;
  openPRs: number;
  mergedPRs: number;
  closedPRs: number;
  averageAIScore?: number;
  pendingAnalysis: number;
}

/**
 * AI Analysis Result
 */
export interface AIAnalysisResult {
  id: string;
  pullRequestId: string;
  score: number;
  summary: string;
  codeQuality: CodeQuality;
  securityIssues: SecurityIssue[];
  suggestions: Suggestion[];
  complexity: ComplexityMetrics;
  analyzedAt: Date;
}

/**
 * Code Quality metrics
 */
export interface CodeQuality {
  score: number;
  maintainability: number;
  readability: number;
  testCoverage?: number;
  duplicateCode?: number;
}

/**
 * Security Issue
 */
export interface SecurityIssue {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  file: string;
  line: number;
  recommendation: string;
}

/**
 * Suggestion
 */
export interface Suggestion {
  type: 'REFACTOR' | 'PERFORMANCE' | 'STYLE' | 'BEST_PRACTICE' | 'DOCUMENTATION';
  title: string;
  description: string;
  file?: string;
  line?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Complexity Metrics
 */
export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  averageFunctionLength: number;
}

/**
 * Fetch Pull Requests Response
 */
export interface FetchPullRequestsResponse {
  pullRequests: PullRequest[];
  total: number;
  page: number;
  pageSize: number;
}
