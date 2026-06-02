import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebhookStatusComponent } from './webhook-status/webhook-status.component';
import { AIProviderSelectorComponent } from './ai-provider-selector/ai-provider-selector.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'ai-provider',
    pathMatch: 'full'
  },
  {
    path: 'ai-provider',
    component: AIProviderSelectorComponent
  },
  {
    path: 'webhooks',
    component: WebhookStatusComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
