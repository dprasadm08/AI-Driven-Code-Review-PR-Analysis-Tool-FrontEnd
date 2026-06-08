import { Component, Input, OnInit } from '@angular/core';
import { PerformanceIssue, PerformanceSeverity, MetricType } from '../../core/models/performance.model';

@Component({
  selector: 'app-performance-issues',
  templateUrl: './performance-issues.component.html',
  styleUrls: ['./performance-issues.component.css']
})
export class PerformanceIssuesComponent implements OnInit {
  @Input() performanceIssues: PerformanceIssue[] = [];
  @Input() isLoading = false;

  filteredIssues: PerformanceIssue[] = [];
  selectedSeverity: PerformanceSeverity | 'all' = 'all';
  selectedMetricType: MetricType | 'all' = 'all';
  searchQuery = '';

  readonly PerformanceSeverity = PerformanceSeverity;
  readonly MetricType = MetricType;

  severityOptions = Object.values(PerformanceSeverity);
  metricTypeOptions = Object.values(MetricType);

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredIssues = this.performanceIssues.filter(issue => {
      const matchesSeverity = this.selectedSeverity === 'all' || issue.severity === this.selectedSeverity;
      const matchesType = this.selectedMetricType === 'all' || issue.metricType === this.selectedMetricType;
      const matchesSearch = this.searchQuery === '' || 
        issue.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        issue.file.toLowerCase().includes(this.searchQuery.toLowerCase());

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

  getSeverityIcon(severity: PerformanceSeverity): string {
    const icons: Record<PerformanceSeverity, string> = {
      [PerformanceSeverity.CRITICAL]: '🔴',
      [PerformanceSeverity.HIGH]: '🟠',
      [PerformanceSeverity.MEDIUM]: '🟡',
      [PerformanceSeverity.LOW]: '🟢'
    };
    return icons[severity] || '📌';
  }

  getMetricIcon(type: MetricType): string {
    const icons: Record<MetricType, string> = {
      [MetricType.CPU]: '⚡',
      [MetricType.MEMORY]: '💾',
      [MetricType.DISK]: '💿',
      [MetricType.NETWORK]: '🌐',
      [MetricType.DATABASE]: '🗄️',
      [MetricType.API_RESPONSE]: '📡',
      [MetricType.BUNDLE_SIZE]: '📦',
      [MetricType.LOAD_TIME]: '⏱️',
      [MetricType.RENDER_TIME]: '🎨',
      [MetricType.THROUGHPUT]: '📊'
    };
    return icons[type] || '📈';
  }

  getImpactColor(impact: string): string {
    const colors: Record<string, string> = {
      'critical': '#dc2626',
      'high': '#ea580c',
      'medium': '#f59e0b',
      'low': '#10b981'
    };
    return colors[impact.toLowerCase()] || '#6b7280';
  }

  toggleStatus(issue: PerformanceIssue, status: 'open' | 'acknowledged' | 'optimized' | 'monitoring'): void {
    issue.status = status;
  }

  getCriticalCount(): number {
    return this.performanceIssues.filter(i => i.severity === PerformanceSeverity.CRITICAL).length;
  }

  getHighCount(): number {
    return this.performanceIssues.filter(i => i.severity === PerformanceSeverity.HIGH).length;
  }

  getAverageImpact(): number {
    if (this.performanceIssues.length === 0) return 0;
    const severityMap: Record<PerformanceSeverity, number> = {
      [PerformanceSeverity.CRITICAL]: 4,
      [PerformanceSeverity.HIGH]: 3,
      [PerformanceSeverity.MEDIUM]: 2,
      [PerformanceSeverity.LOW]: 1
    };
    const total = this.performanceIssues.reduce((sum, i) => sum + (severityMap[i.severity] || 0), 0);
    return Math.round((total / this.performanceIssues.length) * 10) / 10;
  }
}
