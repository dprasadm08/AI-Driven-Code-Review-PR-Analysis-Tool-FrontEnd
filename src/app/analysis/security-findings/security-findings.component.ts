import { Component, Input, OnInit } from '@angular/core';
import { SecurityFinding, SecuritySeverity, SecurityVulnerabilityType } from '../../core/models/security.model';

@Component({
  selector: 'app-security-findings',
  templateUrl: './security-findings.component.html',
  styleUrls: ['./security-findings.component.css']
})
export class SecurityFindingsComponent implements OnInit {
  @Input() securityFindings: SecurityFinding[] = [];
  @Input() isLoading = false;

  filteredFindings: SecurityFinding[] = [];
  selectedSeverity: SecuritySeverity | 'all' = 'all';
  selectedType: SecurityVulnerabilityType | 'all' = 'all';
  searchQuery = '';

  readonly SecuritySeverity = SecuritySeverity;
  readonly SecurityVulnerabilityType = SecurityVulnerabilityType;

  severityOptions = Object.values(SecuritySeverity);
  typeOptions = Object.values(SecurityVulnerabilityType);

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredFindings = this.securityFindings.filter(finding => {
      const matchesSeverity = this.selectedSeverity === 'all' || finding.severity === this.selectedSeverity;
      const matchesType = this.selectedType === 'all' || finding.vulnerabilityType === this.selectedType;
      const matchesSearch = this.searchQuery === '' || 
        finding.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        finding.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        finding.file.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesSeverity && matchesType && matchesSearch;
    });
  }

  onSeverityChange(): void {
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getSeverityIcon(severity: SecuritySeverity): string {
    const icons: Record<SecuritySeverity, string> = {
      [SecuritySeverity.CRITICAL]: '🔴',
      [SecuritySeverity.HIGH]: '🟠',
      [SecuritySeverity.MEDIUM]: '🟡',
      [SecuritySeverity.LOW]: '🟢'
    };
    return icons[severity] || '📌';
  }

  getVulnerabilityIcon(type: SecurityVulnerabilityType): string {
    const icons: Record<SecurityVulnerabilityType, string> = {
      [SecurityVulnerabilityType.SQL_INJECTION]: '💉',
      [SecurityVulnerabilityType.CROSS_SITE_SCRIPTING]: '🔗',
      [SecurityVulnerabilityType.AUTHENTICATION]: '🔐',
      [SecurityVulnerabilityType.AUTHORIZATION]: '👤',
      [SecurityVulnerabilityType.CRYPTOGRAPHY]: '🔑',
      [SecurityVulnerabilityType.INJECTION]: '💉',
      [SecurityVulnerabilityType.SENSITIVE_DATA_EXPOSURE]: '📋',
      [SecurityVulnerabilityType.WEAK_CRYPTOGRAPHY]: '⚠️',
      [SecurityVulnerabilityType.INSECURE_DESERIALIZATION]: '📦',
      [SecurityVulnerabilityType.EXTERNAL_ENTITY]: '🌐',
      [SecurityVulnerabilityType.BROKEN_ACCESS_CONTROL]: '🚫',
      [SecurityVulnerabilityType.SECURITY_MISCONFIGURATION]: '⚙️',
      [SecurityVulnerabilityType.MALICIOUS_CODE]: '🦠',
      [SecurityVulnerabilityType.INSUFFICIENT_LOGGING]: '📊',
      [SecurityVulnerabilityType.OTHER]: '🔒'
    };
    return icons[type] || '🔒';
  }

  getImpactBadgeColor(impactScore?: number): string {
    if (!impactScore) return '#6b7280';
    if (impactScore >= 9) return '#dc2626';
    if (impactScore >= 7) return '#ea580c';
    if (impactScore >= 5) return '#f59e0b';
    return '#10b981';
  }

  toggleStatus(finding: SecurityFinding, status: 'open' | 'verified' | 'remediated' | 'false-positive'): void {
    finding.status = status;
  }

  getCriticalsCount(): number {
    return this.securityFindings.filter(f => f.severity === SecuritySeverity.CRITICAL).length;
  }

  getHighCount(): number {
    return this.securityFindings.filter(f => f.severity === SecuritySeverity.HIGH).length;
  }

  getAverageRiskScore(): number {
    if (this.securityFindings.length === 0) return 0;
    const total = this.securityFindings.reduce((sum, f) => sum + (f.impactScore || 0), 0);
    return Math.round(total / this.securityFindings.length);
  }
}
