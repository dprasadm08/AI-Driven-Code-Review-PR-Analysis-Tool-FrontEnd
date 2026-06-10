import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisRoutingModule } from './analysis-routing.module';
import { AnalysisDashboardComponent } from './analysis-dashboard/analysis-dashboard.component';
import { AnalysisHistoryComponent } from './analysis-history/analysis-history.component';
import { AnalysisDetailsComponent } from './analysis-details/analysis-details.component';
import { BugFindingsComponent } from './bug-findings/bug-findings.component';
import { SecurityFindingsComponent } from './security-findings/security-findings.component';
import { PerformanceIssuesComponent } from './performance-issues/performance-issues.component';
import { MetricsCardsComponent } from './metrics-cards/metrics-cards.component';
import { CodeQualityFindingsComponent } from './code-quality-findings/code-quality-findings.component';
import { TestRecommendationsComponent } from './test-recommendations/test-recommendations.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AnalysisDashboardComponent,
    AnalysisHistoryComponent,
    AnalysisDetailsComponent,
    BugFindingsComponent,
    SecurityFindingsComponent,
    PerformanceIssuesComponent,
    MetricsCardsComponent,
    CodeQualityFindingsComponent,
    TestRecommendationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AnalysisRoutingModule,
    SharedModule
  ]
})
export class AnalysisModule { }
