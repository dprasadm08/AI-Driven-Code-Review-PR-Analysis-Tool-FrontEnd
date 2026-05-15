import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    totalRepositories: 0,
    totalPullRequests: 0,
    analyzedToday: 0,
    pendingReviews: 0
  };

  recentAnalyses: any[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Load actual data from service
    this.stats = {
      totalRepositories: 12,
      totalPullRequests: 45,
      analyzedToday: 8,
      pendingReviews: 3
    };
  }
}
