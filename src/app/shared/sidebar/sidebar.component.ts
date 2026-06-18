import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/repositories', icon: '📁', label: 'Repositories' },
    { path: '/pull-requests', icon: '🔀', label: 'Pull Requests' },
    { path: '/analysis', icon: '🔍', label: 'Analysis' }
  ];
}
