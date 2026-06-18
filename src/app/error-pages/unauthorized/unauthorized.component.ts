import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {
  requestedPath = '';

  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Capture the previous URL path for context
    this.requestedPath = this.router.url;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    this.location.back();
  }
}
