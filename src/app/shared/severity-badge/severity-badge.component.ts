import { Component, Input } from '@angular/core';
import { SecuritySeverity } from '../../core/models/security.model';
import { SeverityLevel } from '../../core/models/analysis.model';
import { PerformanceSeverity } from '../../core/models/performance.model';
import { TestPriority } from '../../core/models/test-recommendation.model';

type SeverityType = SecuritySeverity | SeverityLevel | PerformanceSeverity | TestPriority;

@Component({
  selector: 'app-severity-badge',
  templateUrl: './severity-badge.component.html',
  styleUrls: ['./severity-badge.component.css']
})
export class SeverityBadgeComponent {
  @Input() severity!: SeverityType;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showIcon = true;
  @Input() showLabel = true;

  readonly SecuritySeverity = SecuritySeverity;
  readonly SeverityLevel = SeverityLevel;

  getSeverityColor(): string {
    const colors: Record<string, string> = {
      'critical': '#dc2626',
      'high': '#ea580c',
      'medium': '#f59e0b',
      'low': '#10b981',
      'info': '#06b6d4'
    };
    return colors[(this.severity as string)?.toLowerCase()] || '#6b7280';
  }

  getSeverityIcon(): string {
    const icons: Record<string, string> = {
      'critical': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢',
      'info': 'ℹ️'
    };
    return icons[(this.severity as string)?.toLowerCase()] || '📌';
  }

  getSeverityLabel(): string {
    return (this.severity as string).toUpperCase();
  }

  getBadgeClass(): string {
    return `badge badge-${this.size} severity-${this.severity}`;
  }

  getBackgroundClass(): string {
    const backgrounds: Record<string, string> = {
      'critical': 'bg-red-50',
      'high': 'bg-orange-50',
      'medium': 'bg-amber-50',
      'low': 'bg-green-50',
      'info': 'bg-cyan-50'
    };
    return backgrounds[(this.severity as string)?.toLowerCase()] || 'bg-gray-50';
  }
}
