import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ErrorPagesRoutingModule } from './error-pages-routing.module';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [
    UnauthorizedComponent,
    NotFoundComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ErrorPagesRoutingModule
  ]
})
export class ErrorPagesModule { }
