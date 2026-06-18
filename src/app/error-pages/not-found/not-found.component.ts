import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {
  constructor(
    private router: Router,
    private location: Location
  ) {}

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    this.location.back();
  }
}
