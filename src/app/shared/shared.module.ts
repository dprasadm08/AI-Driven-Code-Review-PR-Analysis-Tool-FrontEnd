import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { SeverityBadgeComponent } from './severity-badge/severity-badge.component';
import { HttpErrorComponent } from './http-error/http-error.component';
import { ErrorNotificationComponent } from './error-notification/error-notification.component';
import { ReplacePipe } from './pipes/replace.pipe';

@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    ConfirmationDialogComponent,
    SeverityBadgeComponent,
    HttpErrorComponent,
    ErrorNotificationComponent,
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
    HttpErrorComponent,
    ErrorNotificationComponent,
    ReplacePipe
  ]
})
export class SharedModule { }
