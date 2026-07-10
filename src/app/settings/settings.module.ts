import { NgModule } from '@angular/core';
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
    SettingsRoutingModule,
    SharedModule
  ]
})
export class SettingsModule { }
