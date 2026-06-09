import { Component, Input, OnInit } from '@angular/core';
import { SeverityLevel } from '../../core/models/analysis.model';
import { CodeQualityCategory, CodeQualityFinding } from '../../core/models/code-quality.model';

@Component({
  selector: 'app-code-quality-findings',
  templateUrl: './code-quality-findings.component.html',
  styleUrls: ['./code-quality-findings.component.css']
})
export class CodeQualityFindingsComponent implements OnInit {
  @Input() codeQualityFindings: CodeQualityFinding[] = [];
  @Input() isLoading = false;

  filteredFindings: CodeQualityFinding[] = [];
  selectedSeverity: SeverityLevel | 'all' = 'all';
  selectedCategory: CodeQualityCategory | 'all' = 'all';
  searchQuery = '';

  readonly SeverityLevel = SeverityLevel;
  readonly CodeQualityCategory = CodeQualityCategory;

  severityOptions = Object.values(SeverityLevel);
  categoryOptions = Object.values(CodeQualityCategory);

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredFindings = this.codeQualityFindings.filter((finding) => {
      const matchesSeverity = this.selectedSeverity === 'all' || finding.severity === this.selectedSeverity;
      const matchesCategory = this.selectedCategory === 'all' || finding.category === this.selectedCategory;
      const matchesSearch =
        this.searchQuery === '' ||
        finding.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        finding.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        finding.file.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesSeverity && matchesCategory && matchesSearch;
    });
  }

  onSeverityChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getCategoryIcon(category: CodeQualityCategory): string {
    const icons: Record<CodeQualityCategory, string> = {
      [CodeQualityCategory.MAINTAINABILITY]: '🛠️',
      [CodeQualityCategory.READABILITY]: '📖',
      [CodeQualityCategory.RELIABILITY]: '🧩',
      [CodeQualityCategory.TESTING]: '🧪',
      [CodeQualityCategory.COMPLEXITY]: '🧠',
      [CodeQualityCategory.BEST_PRACTICES]: '✅'
    };
    return icons[category] || '📌';
  }

  getCategoryCount(category: CodeQualityCategory): number {
    return this.codeQualityFindings.filter((finding) => finding.category === category).length;
  }

  getCriticalCount(): number {
    return this.codeQualityFindings.filter((finding) => finding.severity === SeverityLevel.CRITICAL).length;
  }

  getHighCount(): number {
    return this.codeQualityFindings.filter((finding) => finding.severity === SeverityLevel.HIGH).length;
  }

  getTotalDebtHours(): number {
    const totalMinutes = this.codeQualityFindings.reduce((sum, finding) => sum + finding.technicalDebtMinutes, 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }

  toggleStatus(finding: CodeQualityFinding, status: 'open' | 'reviewing' | 'refactored' | 'wont-fix'): void {
    finding.status = status;
  }
}
