import { Component, Input } from '@angular/core';
import { SecuritySeverity } from '../../core/models/security.model';
import { SeverityLevel } from '../../core/models/analysis.model';

type SeverityType = SecuritySeverity | SeverityLevel;

@Component({
  selector: 'app-severity-badge',
  templateUrl: './severity-badge.component.html',
  styleUrls: ['./severity-badge.component.css']
})
export class SeverityBadgeComponent {
  @Input() severity: SeverityType;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showIcon = true;
  @Input() showLabel = true;

  readonly SecuritySeverity = SecuritySeverity;
  readonly SeverityLevel = SeverityLevel;

  getSeverityColor(): string {
    const colors: Record<string, string> = {
      [SecuritySeverity.CRITICAL]: '#dc2626',
      [SecuritySeverity.HIGH]: '#ea580c',
      [SecuritySeverity.MEDIUM]: '#f59e0b',
      [SecuritySeverity.LOW]: '#10b981',
      [SeverityLevel.CRITICAL]: '#dc2626',
      [SeverityLevel.HIGH]: '#ea580c',
      [SeverityLevel.MEDIUM]: '#f59e0b',
      [SeverityLevel.LOW]: '#10b981',
      [SeverityLevel.INFO]: '#06b6d4'
    };
    return colors[this.severity as string] || '#6b7280';
  }

  getSeverityIcon(): string {
    const icons: Record<string, string> = {
      [SecuritySeverity.CRITICAL]: '🔴',
      [SecuritySeverity.HIGH]: '🟠',
      [SecuritySeverity.MEDIUM]: '🟡',
      [SecuritySeverity.LOW]: '🟢',
      [SeverityLevel.CRITICAL]: '⚠️',
      [SeverityLevel.HIGH]: '❌',
      [SeverityLevel.MEDIUM]: '⚡',
      [SeverityLevel.LOW]: '✓',
      [SeverityLevel.INFO]: 'ℹ️'
    };
    return icons[this.severity as string] || '📌';
  }

  getSeverityLabel(): string {
    return (this.severity as string).toUpperCase();
  }

  getBadgeClass(): string {
    return `badge badge-${this.size} severity-${this.severity}`;
  }

  getBackgroundClass(): string {
    const backgrounds: Record<string, string> = {
      [SecuritySeverity.CRITICAL]: 'bg-red-50',
      [SecuritySeverity.HIGH]: 'bg-orange-50',
      [SecuritySeverity.MEDIUM]: 'bg-amber-50',
      [SecuritySeverity.LOW]: 'bg-green-50',
      [SeverityLevel.CRITICAL]: 'bg-red-50',
      [SeverityLevel.HIGH]: 'bg-orange-50',
      [SeverityLevel.MEDIUM]: 'bg-amber-50',
      [SeverityLevel.LOW]: 'bg-green-50',
      [SeverityLevel.INFO]: 'bg-cyan-50'
    };
    return backgrounds[this.severity as string] || 'bg-gray-50';
  }
}
