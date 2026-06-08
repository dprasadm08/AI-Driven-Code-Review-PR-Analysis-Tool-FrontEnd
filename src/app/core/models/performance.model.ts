export enum PerformanceSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum MetricType {
  CPU = 'cpu',
  MEMORY = 'memory',
  DISK = 'disk',
  NETWORK = 'network',
  DATABASE = 'database',
  API_RESPONSE = 'api-response',
  BUNDLE_SIZE = 'bundle-size',
  LOAD_TIME = 'load-time',
  RENDER_TIME = 'render-time',
  THROUGHPUT = 'throughput'
}

export interface PerformanceIssue {
  id: string;
  title: string;
  description: string;
  severity: PerformanceSeverity;
  metricType: MetricType;
  file: string;
  lineNumber?: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  impact: string;
  suggestion: string;
  detectedAt: Date;
  status?: 'open' | 'acknowledged' | 'optimized' | 'monitoring';
}

export interface PerformanceMetric {
  id: string;
  name: string;
  type: MetricType;
  currentValue: number;
  previousValue?: number;
  targetValue: number;
  unit: string;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
  timestamp: Date;
  historicalData?: MetricDataPoint[];
}

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
}

export interface PerformanceReport {
  id: string;
  pullRequestId: string;
  repositoryId: string;
  reportDate: Date;
  totalIssues: number;
  performanceIssues: PerformanceIssue[];
  metrics: PerformanceMetric[];
  overallScore: number;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface PerformanceSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  overallScore: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface PerformanceTrend {
  date: Date;
  overallScore: number;
  criticalCount: number;
  trend: 'improving' | 'stable' | 'degrading';
}
