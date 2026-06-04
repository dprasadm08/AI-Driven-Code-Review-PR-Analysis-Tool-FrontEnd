import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisRoutingModule } from './analysis-routing.module';
import { AnalysisDashboardComponent } from './analysis-dashboard/analysis-dashboard.component';
import { AnalysisHistoryComponent } from './analysis-history/analysis-history.component';
import { AnalysisDetailsComponent } from './analysis-details/analysis-details.component';
import { BugFindingsComponent } from './bug-findings/bug-findings.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AnalysisDashboardComponent,
    AnalysisHistoryComponent,
    AnalysisDetailsComponent,
    BugFindingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AnalysisRoutingModule,
    SharedModule
  ]
})
export class AnalysisModule { }
