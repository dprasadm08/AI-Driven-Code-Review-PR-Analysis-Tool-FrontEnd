import { BugFinding } from './analysis.model';
import { SecurityFinding } from './security.model';
import { PerformanceIssue, PerformanceMetric } from './performance.model';
import { CodeQualityFinding } from './code-quality.model';
import { TestCase, TestRecommendation } from './test-recommendation.model';

export interface CombinedAnalysisRequest {
  repositoryId: string;
  pullRequestId: string;
  branchName?: string;
  targetBranch?: string;
  commitSha?: string;
  includeTests?: boolean;
  analysisTypes?: AnalysisType[];
}

export type AnalysisType = 'bugs' | 'security' | 'performance' | 'code-quality' | 'tests';

export interface CombinedAnalysisResponse {
  id: string;
  repositoryId: string;
  pullRequestId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  analyzedAt: Date;
  completedAt?: Date;
  findings: AnalysisFindings;
  summary: AnalysisSummary;
  recommendations: string[];
  errorMessage?: string;
}

export interface AnalysisFindings {
  bugs: BugFinding[];
  security: SecurityFinding[];
  performance: {
    issues: PerformanceIssue[];
    metrics: PerformanceMetric[];
  };
  codeQuality: CodeQualityFinding[];
  tests: {
    cases: TestCase[];
    recommendations: TestRecommendation[];
  };
}

export interface AnalysisSummary {
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  overallScore: number; // 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  issueBreakdown: {
    bugs: number;
    security: number;
    performance: number;
    codeQuality: number;
    tests: number;
  };
  estimatedFixTime: number; // in minutes
  technicalDebt: number; // in minutes
}

export interface AnalysisTriggerRequest {
  repositoryId: string;
  pullRequestId?: string;
  analysisType?: 'full' | 'quick' | 'security-focused' | 'performance-focused';
  priority?: 'normal' | 'high' | 'critical';
}

export interface AnalysisTriggerResponse {
  analysisId: string;
  status: string;
  message: string;
  estimatedDuration: number; // in seconds
}

export interface AnalysisHistory {
  id: string;
  repositoryId: string;
  pullRequestId: string;
  branch?: string;
  analyzedAt: Date;
  completedAt?: Date;
  status: 'completed' | 'failed' | 'pending';
  summary: AnalysisSummary;
  totalIssues: number;
}
