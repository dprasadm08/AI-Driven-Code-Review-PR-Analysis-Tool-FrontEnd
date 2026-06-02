import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsRoutingModule } from './settings-routing.module';
import { WebhookStatusComponent } from './webhook-status/webhook-status.component';
import { AIProviderSelectorComponent } from './ai-provider-selector/ai-provider-selector.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    WebhookStatusComponent,
    AIProviderSelectorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    SharedModule
  ]
})
export class SettingsModule { }
