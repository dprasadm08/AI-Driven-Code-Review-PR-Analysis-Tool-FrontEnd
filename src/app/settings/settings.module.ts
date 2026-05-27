import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsRoutingModule } from './settings-routing.module';
import { WebhookStatusComponent } from './webhook-status/webhook-status.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    WebhookStatusComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SettingsRoutingModule,
    SharedModule
  ]
})
export class SettingsModule { }
