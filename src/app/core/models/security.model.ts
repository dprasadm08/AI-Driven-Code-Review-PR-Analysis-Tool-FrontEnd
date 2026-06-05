export enum SecuritySeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum SecurityVulnerabilityType {
  SQL_INJECTION = 'sql-injection',
  CROSS_SITE_SCRIPTING = 'cross-site-scripting',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  CRYPTOGRAPHY = 'cryptography',
  INJECTION = 'injection',
  SENSITIVE_DATA_EXPOSURE = 'sensitive-data-exposure',
  WEAK_CRYPTOGRAPHY = 'weak-cryptography',
  INSECURE_DESERIALIZATION = 'insecure-deserialization',
  EXTERNAL_ENTITY = 'external-entity',
  BROKEN_ACCESS_CONTROL = 'broken-access-control',
  SECURITY_MISCONFIGURATION = 'security-misconfiguration',
  MALICIOUS_CODE = 'malicious-code',
  INSUFFICIENT_LOGGING = 'insufficient-logging',
  OTHER = 'other'
}

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  vulnerabilityType: SecurityVulnerabilityType;
  file: string;
  lineNumber: number;
  codeSnippet?: string;
  remediation: string;
  cweId?: string;
  owasp?: string;
  impactScore?: number;
  affectedSystems?: string[];
  detectedAt: Date;
  status?: 'open' | 'verified' | 'remediated' | 'false-positive';
}

export interface SecurityScan {
  id: string;
  pullRequestId: string;
  repositoryId: string;
  scanDate: Date;
  totalVulnerabilities: number;
  securityFindings: SecurityFinding[];
  riskScore: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface SecuritySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  riskScore: number;
  complianceStatus: string;
}

export interface SecurityTrend {
  date: Date;
  totalFindings: number;
  criticalCount: number;
  trend: 'improving' | 'stable' | 'degrading';
}
