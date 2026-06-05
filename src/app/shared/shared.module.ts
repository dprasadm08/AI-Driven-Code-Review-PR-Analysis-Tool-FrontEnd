import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { SeverityBadgeComponent } from './severity-badge/severity-badge.component';
import { ReplacePipe } from './pipes/replace.pipe';

@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    ConfirmationDialogComponent,
    SeverityBadgeComponent,
    ReplacePipe
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    ConfirmationDialogComponent,
    SeverityBadgeComponent,
    ReplacePipe
  ]
})
export class SharedModule { }
