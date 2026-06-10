import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TestType, TestPriority, TestCase, TestRecommendation } from '../../core/models/test-recommendation.model';

@Component({
  selector: 'app-test-recommendations',
  templateUrl: './test-recommendations.component.html',
  styleUrls: ['./test-recommendations.component.css']
})
export class TestRecommendationsComponent implements OnInit, OnChanges {
  @Input() testRecommendations: TestRecommendation[] = [];
  @Input() testCases: TestCase[] = [];
  @Input() isLoading = false;

  filteredTestCases: TestCase[] = [];
  selectedType: TestType | 'all' = 'all';
  selectedPriority: TestPriority | 'all' = 'all';
  selectedStatus: string | 'all' = 'all';
  searchQuery = '';

  readonly TestType = TestType;
  readonly TestPriority = TestPriority;

  typeOptions = Object.values(TestType);
  priorityOptions = Object.values(TestPriority);
  statusOptions = ['suggested', 'in-progress', 'implemented', 'passed', 'skipped'];

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['testCases'] || changes['selectedType'] || changes['selectedPriority']) {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    this.filteredTestCases = this.testCases.filter((testCase) => {
      const matchesType = this.selectedType === 'all' || testCase.type === this.selectedType;
      const matchesPriority = this.selectedPriority === 'all' || testCase.priority === this.selectedPriority;
      const matchesStatus = this.selectedStatus === 'all' || testCase.status === this.selectedStatus;
      const matchesSearch =
        this.searchQuery === '' ||
        testCase.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        testCase.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        testCase.file.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesType && matchesPriority && matchesStatus && matchesSearch;
    });
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  onPriorityChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getTestTypeIcon(type: TestType): string {
    const icons: Record<TestType, string> = {
      [TestType.UNIT]: '🧩',
      [TestType.INTEGRATION]: '🔗',
      [TestType.E2E]: '🌐',
      [TestType.PERFORMANCE]: '⚡',
      [TestType.SECURITY]: '🔒',
      [TestType.MUTATION]: '🧬'
    };
    return icons[type] || '📋';
  }

  getPriorityIcon(priority: TestPriority): string {
    const icons: Record<TestPriority, string> = {
      [TestPriority.CRITICAL]: '🔴',
      [TestPriority.HIGH]: '🟠',
      [TestPriority.MEDIUM]: '🟡',
      [TestPriority.LOW]: '🟢'
    };
    return icons[priority] || '⚪';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      suggested: '💡',
      'in-progress': '⏳',
      implemented: '✅',
      passed: '✔️',
      skipped: '⏭️'
    };
    return icons[status] || '📌';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      suggested: '#3b82f6',
      'in-progress': '#f59e0b',
      implemented: '#8b5cf6',
      passed: '#10b981',
      skipped: '#6b7280'
    };
    return colors[status] || '#94a3b8';
  }

  getCriticalCount(): number {
    return this.testCases.filter((tc) => tc.priority === TestPriority.CRITICAL).length;
  }

  getImplementedCount(): number {
    return this.testCases.filter((tc) => tc.status === 'implemented' || tc.status === 'passed').length;
  }

  getTotalEstimatedHours(): number {
    const totalMinutes = this.testCases.reduce((sum, tc) => sum + tc.estimatedMinutes, 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }

  getAverageCoverage(): number {
    if (this.testRecommendations.length === 0) return 0;
    const totalCoverage = this.testRecommendations.reduce((sum, rec) => sum + rec.coverage, 0);
    return Math.round((totalCoverage / this.testRecommendations.length) * 10) / 10;
  }

  toggleStatus(testCase: TestCase, status: 'suggested' | 'in-progress' | 'implemented' | 'passed' | 'skipped'): void {
    testCase.status = status;
  }
}
