import { NgModule } from '@angular/core';
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
    PullRequestsRoutingModule,
    SharedModule
  ]
})
export class PullRequestsModule { }
