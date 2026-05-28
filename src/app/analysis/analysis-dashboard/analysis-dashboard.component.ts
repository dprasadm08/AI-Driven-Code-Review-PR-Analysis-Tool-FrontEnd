import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-analysis-dashboard',
  templateUrl: './analysis-dashboard.component.html',
  styleUrls: ['./analysis-dashboard.component.css']
})
export class AnalysisDashboardComponent implements OnInit {
  analyses: any[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadAnalysisShell();
  }

  loadAnalysisShell(): void {
    this.isLoading = false;
    this.errorMessage = '';
    this.analyses = [];
  }
}
