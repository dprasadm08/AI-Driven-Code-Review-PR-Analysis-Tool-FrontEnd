import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebhookStatusComponent } from './webhook-status/webhook-status.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'webhooks',
    pathMatch: 'full'
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
