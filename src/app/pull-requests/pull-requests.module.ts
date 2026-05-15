import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PullRequestsRoutingModule } from './pull-requests-routing.module';
import { PrListComponent } from './pr-list/pr-list.component';
import { PrDetailsComponent } from './pr-details/pr-details.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    PrListComponent,
    PrDetailsComponent
  ],
  imports: [
    CommonModule,
    PullRequestsRoutingModule,
    SharedModule
  ]
})
export class PullRequestsModule { }
