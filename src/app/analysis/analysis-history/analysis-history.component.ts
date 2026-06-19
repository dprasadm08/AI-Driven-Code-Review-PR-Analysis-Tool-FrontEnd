import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from '../../core/services/analysis.service';
import { AnalysisHistory } from '../../core/models/combined-analysis.model';

@Component({
  selector: 'app-analysis-history',
  templateUrl: './analysis-history.component.html',
  styleUrls: ['./analysis-history.component.css']
})
export class AnalysisHistoryComponent implements OnInit, OnDestroy {
  history: AnalysisHistory[] = [];
  filteredHistory: AnalysisHistory[] = [];
  isLoading = false;
  errorMessage = '';
  loadingMessage = 'Loading analysis history...';
  retrying = false;

  // Filters
  filterStatus: string = 'all';
  filterRisk: string = 'all';
  searchQuery: string = '';

  // Sorting
  sortColumn: keyof AnalysisHistory | 'totalIssues' | 'riskLevel' = 'analyzedAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  statusOptions = ['all', 'completed', 'failed', 'pending'];
  riskOptions = ['all', 'critical', 'high', 'medium', 'low', 'safe'];

  private destroy$ = new Subject<void>();

  constructor(private analysisService: AnalysisService) {}

  ngOnInit(): void {
    this.loadMockHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retryLoad(): void {
    this.retrying = true;
    this.errorMessage = '';
    this.loadingMessage = 'Retrying analysis history...';
    this.loadMockHistory();
  }

  private loadMockHistory(): void {
    this.isLoading = true;
    this.loadingMessage = this.retrying ? 'Retrying analysis history...' : 'Loading analysis history...';
    setTimeout(() => {
      this.history = [
        {
          id: 'an-001', repositoryId: 'repo-1', pullRequestId: 'pr-42', branch: 'feature/auth-refactor',
          analyzedAt: new Date('2026-06-15T10:30:00'), completedAt: new Date('2026-06-15T10:31:45'), status: 'completed',
          totalIssues: 14,
          summary: { totalIssues: 14, criticalCount: 2, highCount: 4, mediumCount: 5, lowCount: 2, infoCount: 1, overallScore: 68, riskLevel: 'high', issueBreakdown: { bugs: 3, security: 4, performance: 2, codeQuality: 4, tests: 1 }, estimatedFixTime: 240, technicalDebt: 310 }
        },
        {
          id: 'an-002', repositoryId: 'repo-1', pullRequestId: 'pr-41', branch: 'fix/login-bug',
          analyzedAt: new Date('2026-06-14T16:00:00'), completedAt: new Date('2026-06-14T16:01:20'), status: 'completed',
          totalIssues: 3,
          summary: { totalIssues: 3, criticalCount: 0, highCount: 1, mediumCount: 2, lowCount: 0, infoCount: 0, overallScore: 91, riskLevel: 'low', issueBreakdown: { bugs: 1, security: 0, performance: 1, codeQuality: 1, tests: 0 }, estimatedFixTime: 45, technicalDebt: 60 }
        },
        {
          id: 'an-003', repositoryId: 'repo-2', pullRequestId: 'pr-18', branch: 'feature/dashboard-ui',
          analyzedAt: new Date('2026-06-14T09:15:00'), completedAt: undefined, status: 'failed',
          totalIssues: 0,
          summary: { totalIssues: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, infoCount: 0, overallScore: 0, riskLevel: 'safe', issueBreakdown: { bugs: 0, security: 0, performance: 0, codeQuality: 0, tests: 0 }, estimatedFixTime: 0, technicalDebt: 0 }
        },
        {
          id: 'an-004', repositoryId: 'repo-1', pullRequestId: 'pr-40', branch: 'feature/payment-gateway',
          analyzedAt: new Date('2026-06-13T14:22:00'), completedAt: new Date('2026-06-13T14:24:15'), status: 'completed',
          totalIssues: 22,
          summary: { totalIssues: 22, criticalCount: 5, highCount: 8, mediumCount: 6, lowCount: 3, infoCount: 0, overallScore: 42, riskLevel: 'critical', issueBreakdown: { bugs: 5, security: 8, performance: 4, codeQuality: 4, tests: 1 }, estimatedFixTime: 540, technicalDebt: 720 }
        },
        {
          id: 'an-005', repositoryId: 'repo-3', pullRequestId: 'pr-9', branch: 'chore/dependency-update',
          analyzedAt: new Date('2026-06-12T11:00:00'), completedAt: new Date('2026-06-12T11:00:55'), status: 'completed',
          totalIssues: 1,
          summary: { totalIssues: 1, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 1, infoCount: 0, overallScore: 98, riskLevel: 'safe', issueBreakdown: { bugs: 0, security: 0, performance: 0, codeQuality: 1, tests: 0 }, estimatedFixTime: 10, technicalDebt: 15 }
        },
        {
          id: 'an-006', repositoryId: 'repo-1', pullRequestId: 'pr-39', branch: 'feature/notifications',
          analyzedAt: new Date('2026-06-12T08:45:00'), completedAt: new Date('2026-06-12T08:47:30'), status: 'completed',
          totalIssues: 9,
          summary: { totalIssues: 9, criticalCount: 1, highCount: 2, mediumCount: 3, lowCount: 3, infoCount: 0, overallScore: 74, riskLevel: 'medium', issueBreakdown: { bugs: 2, security: 1, performance: 3, codeQuality: 2, tests: 1 }, estimatedFixTime: 120, technicalDebt: 160 }
        },
        {
          id: 'an-007', repositoryId: 'repo-2', pullRequestId: 'pr-17', branch: 'fix/memory-leak',
          analyzedAt: new Date('2026-06-11T15:30:00'), completedAt: new Date('2026-06-11T15:31:10'), status: 'completed',
          totalIssues: 6,
          summary: { totalIssues: 6, criticalCount: 1, highCount: 3, mediumCount: 1, lowCount: 1, infoCount: 0, overallScore: 79, riskLevel: 'high', issueBreakdown: { bugs: 2, security: 0, performance: 3, codeQuality: 1, tests: 0 }, estimatedFixTime: 90, technicalDebt: 120 }
        },
        {
          id: 'an-008', repositoryId: 'repo-1', pullRequestId: 'pr-38', branch: 'feature/user-profiles',
          analyzedAt: new Date('2026-06-10T13:00:00'), completedAt: new Date('2026-06-10T13:02:45'), status: 'completed',
          totalIssues: 11,
          summary: { totalIssues: 11, criticalCount: 0, highCount: 3, mediumCount: 5, lowCount: 2, infoCount: 1, overallScore: 82, riskLevel: 'medium', issueBreakdown: { bugs: 3, security: 1, performance: 2, codeQuality: 4, tests: 1 }, estimatedFixTime: 180, technicalDebt: 230 }
        },
        {
          id: 'an-009', repositoryId: 'repo-3', pullRequestId: 'pr-8', branch: 'fix/api-timeout',
          analyzedAt: new Date('2026-06-09T10:20:00'), completedAt: new Date('2026-06-09T10:21:00'), status: 'completed',
          totalIssues: 4,
          summary: { totalIssues: 4, criticalCount: 0, highCount: 1, mediumCount: 2, lowCount: 1, infoCount: 0, overallScore: 88, riskLevel: 'low', issueBreakdown: { bugs: 1, security: 0, performance: 2, codeQuality: 1, tests: 0 }, estimatedFixTime: 60, technicalDebt: 80 }
        },
        {
          id: 'an-010', repositoryId: 'repo-1', pullRequestId: 'pr-37', branch: 'feature/export-csv',
          analyzedAt: new Date('2026-06-08T09:00:00'), completedAt: new Date('2026-06-08T09:01:30'), status: 'completed',
          totalIssues: 7,
          summary: { totalIssues: 7, criticalCount: 0, highCount: 2, mediumCount: 3, lowCount: 2, infoCount: 0, overallScore: 85, riskLevel: 'medium', issueBreakdown: { bugs: 2, security: 0, performance: 1, codeQuality: 3, tests: 1 }, estimatedFixTime: 100, technicalDebt: 135 }
        },
        {
          id: 'an-011', repositoryId: 'repo-2', pullRequestId: 'pr-16', branch: 'chore/lint-fixes',
          analyzedAt: new Date('2026-06-07T16:45:00'), completedAt: new Date('2026-06-07T16:46:00'), status: 'completed',
          totalIssues: 0,
          summary: { totalIssues: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, infoCount: 0, overallScore: 100, riskLevel: 'safe', issueBreakdown: { bugs: 0, security: 0, performance: 0, codeQuality: 0, tests: 0 }, estimatedFixTime: 0, technicalDebt: 0 }
        },
        {
          id: 'an-012', repositoryId: 'repo-1', pullRequestId: 'pr-36', branch: 'feature/webhooks',
          analyzedAt: new Date('2026-06-06T11:30:00'), completedAt: undefined, status: 'pending',
          totalIssues: 0,
          summary: { totalIssues: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, infoCount: 0, overallScore: 0, riskLevel: 'safe', issueBreakdown: { bugs: 0, security: 0, performance: 0, codeQuality: 0, tests: 0 }, estimatedFixTime: 0, technicalDebt: 0 }
        }
      ] as AnalysisHistory[];
      this.applyFilters();
      this.isLoading = false;
      this.retrying = false;
      this.loadingMessage = 'Loading analysis history...';
    }, 800);
  }

  applyFilters(): void {
    let result = [...this.history];

    if (this.filterStatus !== 'all') {
      result = result.filter(h => h.status === this.filterStatus);
    }
    if (this.filterRisk !== 'all') {
      result = result.filter(h => h.summary?.riskLevel === this.filterRisk);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(h =>
        h.pullRequestId.toLowerCase().includes(q) ||
        (h.branch || '').toLowerCase().includes(q) ||
        h.repositoryId.toLowerCase().includes(q)
      );
    }

    result = this.sortData(result);
    this.filteredHistory = result;
    this.currentPage = 1;
  }

  sortBy(column: typeof this.sortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    this.filteredHistory = this.sortData([...this.filteredHistory]);
  }

  private sortData(data: AnalysisHistory[]): AnalysisHistory[] {
    return data.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (this.sortColumn === 'totalIssues') {
        valA = a.summary?.totalIssues ?? 0;
        valB = b.summary?.totalIssues ?? 0;
      } else if (this.sortColumn === 'riskLevel') {
        const order = { critical: 0, high: 1, medium: 2, low: 3, safe: 4 };
        valA = order[a.summary?.riskLevel as keyof typeof order] ?? 5;
        valB = order[b.summary?.riskLevel as keyof typeof order] ?? 5;
      } else if (this.sortColumn === 'analyzedAt') {
        valA = new Date(a.analyzedAt).getTime();
        valB = new Date(b.analyzedAt).getTime();
      } else {
        valA = (a as any)[this.sortColumn] ?? '';
        valB = (b as any)[this.sortColumn] ?? '';
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get pagedHistory(): AnalysisHistory[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredHistory.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredHistory.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { completed: 'status-completed', failed: 'status-failed', pending: 'status-pending' };
    return map[status] || 'status-unknown';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = { completed: '✅', failed: '❌', pending: '⏳' };
    return map[status] || '•';
  }

  getRiskClass(risk: string): string {
    const map: Record<string, string> = { critical: 'risk-critical', high: 'risk-high', medium: 'risk-medium', low: 'risk-low', safe: 'risk-safe' };
    return map[risk] || 'risk-unknown';
  }

  getSortIcon(col: string): string {
    if (this.sortColumn !== col) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  getDuration(h: AnalysisHistory): string {
    if (!h.completedAt) return '—';
    const ms = new Date(h.completedAt).getTime() - new Date(h.analyzedAt).getTime();
    const s = Math.round(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  }

  getScore(h: AnalysisHistory): number {
    return h.summary?.overallScore ?? 0;
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-safe';
    if (score >= 75) return 'score-low';
    if (score >= 55) return 'score-medium';
    if (score >= 35) return 'score-high';
    return 'score-critical';
  }
}
