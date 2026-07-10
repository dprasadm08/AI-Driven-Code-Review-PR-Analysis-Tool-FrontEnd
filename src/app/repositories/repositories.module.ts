import { NgModule } from '@angular/core';
import { RepositoriesRoutingModule } from './repositories-routing.module';
import { RepositoryListComponent } from './repository-list/repository-list.component';
import { AddRepositoryComponent } from './add-repository/add-repository.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    RepositoryListComponent,
    AddRepositoryComponent
  ],
  imports: [
    RepositoriesRoutingModule,
    SharedModule
  ]
})
export class RepositoriesModule { }
