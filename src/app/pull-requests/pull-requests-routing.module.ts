import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrListComponent } from './pr-list/pr-list.component';
import { PrDetailsComponent } from './pr-details/pr-details.component';

const routes: Routes = [
  {
    path: '',
    component: PrListComponent
  },
  {
    path: ':id',
    component: PrDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PullRequestsRoutingModule { }
