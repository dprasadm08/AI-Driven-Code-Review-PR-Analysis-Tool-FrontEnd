export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  MUTATION = 'mutation'
}

export enum TestPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  file: string;
  lineNumber?: number;
  type: TestType;
  priority: TestPriority;
  expectedBehavior: string;
  setupCode?: string;
  assertionCode?: string;
  estimatedMinutes: number;
  relatedIssueIds: string[];
  status: 'suggested' | 'in-progress' | 'implemented' | 'passed' | 'skipped';
}

export interface TestRecommendation {
  id: string;
  title: string;
  description: string;
  testCases: TestCase[];
  coverage: number;
  totalLines: number;
  coveredLines: number;
  criticalGaps: number;
  priority: TestPriority;
  estimatedHours: number;
  createdAt: Date;
  lastUpdated: Date;
}
