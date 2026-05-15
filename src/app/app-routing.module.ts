import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'repositories',
    loadChildren: () => import('./repositories/repositories.module').then(m => m.RepositoriesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pull-requests',
    loadChildren: () => import('./pull-requests/pull-requests.module').then(m => m.PullRequestsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'analysis',
    loadChildren: () => import('./analysis/analysis.module').then(m => m.AnalysisModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
