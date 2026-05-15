import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalysisDashboardComponent } from './analysis-dashboard/analysis-dashboard.component';
import { AnalysisHistoryComponent } from './analysis-history/analysis-history.component';
import { AnalysisDetailsComponent } from './analysis-details/analysis-details.component';

const routes: Routes = [
  {
    path: '',
    component: AnalysisDashboardComponent
  },
  {
    path: 'history',
    component: AnalysisHistoryComponent
  },
  {
    path: ':id',
    component: AnalysisDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalysisRoutingModule { }
