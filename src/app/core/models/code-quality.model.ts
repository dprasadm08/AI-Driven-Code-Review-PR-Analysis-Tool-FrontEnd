import { SeverityLevel } from './analysis.model';

export enum CodeQualityCategory {
  MAINTAINABILITY = 'maintainability',
  READABILITY = 'readability',
  RELIABILITY = 'reliability',
  TESTING = 'testing',
  COMPLEXITY = 'complexity',
  BEST_PRACTICES = 'best-practices'
}

export interface CodeQualityFinding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  category: CodeQualityCategory;
  file: string;
  lineNumber?: number;
  codeSnippet?: string;
  suggestion: string;
  technicalDebtMinutes: number;
  detectedAt: Date;
  status: 'open' | 'reviewing' | 'refactored' | 'wont-fix';
}
