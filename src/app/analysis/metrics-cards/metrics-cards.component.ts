import { Component, Input } from '@angular/core';
import { PerformanceMetric, MetricType } from '../../core/models/performance.model';

@Component({
  selector: 'app-metrics-cards',
  templateUrl: './metrics-cards.component.html',
  styleUrls: ['./metrics-cards.component.css']
})
export class MetricsCardsComponent {
  @Input() metrics: PerformanceMetric[] = [];
  @Input() isLoading = false;

  readonly MetricType = MetricType;

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

  getMetricColor(status: string): string {
    const colors: Record<string, string> = {
      healthy: '#10b981',
      warning: '#f59e0b',
      critical: '#dc2626'
    };
    return colors[status] || '#6b7280';
  }

  getStatusBadgeClass(status: string): string {
    return `status-badge status-${status}`;
  }

  getTrendArrow(trend: string): string {
    const arrows: Record<string, string> = {
      improving: '📈',
      stable: '➡️',
      degrading: '📉'
    };
    return arrows[trend] || '➡️';
  }

  getTrendColor(trend: string): string {
    const colors: Record<string, string> = {
      improving: '#10b981',
      stable: '#6b7280',
      degrading: '#dc2626'
    };
    return colors[trend] || '#6b7280';
  }

  getPercentageChange(metric: PerformanceMetric): number {
    if (!metric.previousValue) return 0;
    return ((metric.currentValue - metric.previousValue) / metric.previousValue) * 100;
  }

  isMetricInRange(metric: PerformanceMetric): boolean {
    return metric.currentValue <= metric.targetValue;
  }
}
