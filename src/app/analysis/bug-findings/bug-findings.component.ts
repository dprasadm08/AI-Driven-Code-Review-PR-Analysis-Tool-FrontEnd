import { Component, Input, OnInit } from '@angular/core';
import { BugFinding, SeverityLevel, IssueType } from '../../core/models/analysis.model';

@Component({
  selector: 'app-bug-findings',
  templateUrl: './bug-findings.component.html',
  styleUrls: ['./bug-findings.component.css']
})
export class BugFindingsComponent implements OnInit {
  @Input() bugFindings: BugFinding[] = [];
  @Input() isLoading = false;

  filteredBugFindings: BugFinding[] = [];
  selectedSeverity: SeverityLevel | 'all' = 'all';
  selectedType: IssueType | 'all' = 'all';
  searchQuery = '';

  readonly SeverityLevel = SeverityLevel;
  readonly IssueType = IssueType;

  severityOptions = Object.values(SeverityLevel);
  typeOptions = Object.values(IssueType);

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredBugFindings = this.bugFindings.filter(bug => {
      const matchesSeverity = this.selectedSeverity === 'all' || bug.severity === this.selectedSeverity;
      const matchesType = this.selectedType === 'all' || bug.type === this.selectedType;
      const matchesSearch = this.searchQuery === '' || 
        bug.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        bug.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        bug.file.toLowerCase().includes(this.searchQuery.toLowerCase());

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

  getSeverityColor(severity: SeverityLevel): string {
    const colors: Record<SeverityLevel, string> = {
      [SeverityLevel.CRITICAL]: '#dc2626',
      [SeverityLevel.HIGH]: '#ea580c',
      [SeverityLevel.MEDIUM]: '#f59e0b',
      [SeverityLevel.LOW]: '#10b981',
      [SeverityLevel.INFO]: '#06b6d4'
    };
    return colors[severity] || '#6b7280';
  }

  getSeverityIcon(severity: SeverityLevel): string {
    const icons: Record<SeverityLevel, string> = {
      [SeverityLevel.CRITICAL]: '⚠️',
      [SeverityLevel.HIGH]: '❌',
      [SeverityLevel.MEDIUM]: '⚡',
      [SeverityLevel.LOW]: '✓',
      [SeverityLevel.INFO]: 'ℹ️'
    };
    return icons[severity] || '📌';
  }

  getTypeIcon(type: IssueType): string {
    const icons: Record<IssueType, string> = {
      [IssueType.BUG]: '🐛',
      [IssueType.SECURITY]: '🔒',
      [IssueType.PERFORMANCE]: '⚡',
      [IssueType.CODE_QUALITY]: '✨',
      [IssueType.DESIGN]: '🎨',
      [IssueType.DOCUMENTATION]: '📚'
    };
    return icons[type] || '📌';
  }

  toggleStatus(bug: BugFinding, status: 'open' | 'resolved' | 'ignored'): void {
    bug.status = status;
  }
}
