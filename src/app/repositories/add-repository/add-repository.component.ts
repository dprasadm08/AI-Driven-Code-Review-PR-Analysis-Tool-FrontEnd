import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-repository',
  templateUrl: './add-repository.component.html',
  styleUrls: ['./add-repository.component.css']
})
export class AddRepositoryComponent {
  repositoryUrl = '';

  constructor(private router: Router) {}

  onSubmit(): void {
    // TODO: Add repository via service
    console.log('Adding repository:', this.repositoryUrl);
  }
}
