import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RepositoryService } from '../../core/services/repository.service';
import { AddRepositoryRequest } from '../../core/models/repository.model';

@Component({
  selector: 'app-add-repository',
  templateUrl: './add-repository.component.html',
  styleUrls: ['./add-repository.component.css']
})
export class AddRepositoryComponent implements OnInit {
  repositoryUrl = '';
  accessToken = '';
  branch = 'main';
  useAccessToken = false;
  
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  isValidating = false;
  
  // Form validation
  formErrors = {
    url: '',
    accessToken: '',
    branch: ''
  };

  // URL validation result
  urlValidation = {
    isValid: false,
    owner: '',
    repo: ''
  };

  constructor(
    private router: Router,
    private repositoryService: RepositoryService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Validate repository URL
   */
  validateUrl(): void {
    this.formErrors.url = '';
    this.urlValidation = {
      isValid: false,
      owner: '',
      repo: ''
    };

    if (!this.repositoryUrl || this.repositoryUrl.trim() === '') {
      this.formErrors.url = 'Repository URL is required';
      return;
    }

    // Validate URL format
    const validation = this.repositoryService.validateRepositoryUrl(this.repositoryUrl);
    
    if (!validation.isValid) {
      this.formErrors.url = validation.error || 'Invalid repository URL';
      return;
    }

    // Parse URL to extract owner and repo
    const parsed = this.repositoryService.parseGithubUrl(this.repositoryUrl);
    
    if (parsed) {
      this.urlValidation = {
        isValid: true,
        owner: parsed.owner,
        repo: parsed.repo
      };
    } else {
      this.formErrors.url = 'Could not parse repository URL';
    }
  }

  /**
   * Validate branch name
   */
  validateBranch(): boolean {
    this.formErrors.branch = '';

    if (!this.branch || this.branch.trim() === '') {
      this.formErrors.branch = 'Branch name is required';
      return false;
    }

    // Branch name validation (basic)
    if (this.branch.length > 255) {
      this.formErrors.branch = 'Branch name is too long';
      return false;
    }

    return true;
  }

  /**
   * Validate access token
   */
  validateAccessToken(): boolean {
    this.formErrors.accessToken = '';

    if (this.useAccessToken && (!this.accessToken || this.accessToken.trim() === '')) {
      this.formErrors.accessToken = 'Access token is required for private repositories';
      return false;
    }

    return true;
  }

  /**
   * Validate entire form
   */
  validateForm(): boolean {
    this.validateUrl();
    const branchValid = this.validateBranch();
    const tokenValid = this.validateAccessToken();

    return this.urlValidation.isValid && branchValid && tokenValid;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    // Prepare request
    const request: AddRepositoryRequest = {
      url: this.repositoryUrl.trim(),
      branch: this.branch.trim()
    };

    if (this.useAccessToken && this.accessToken) {
      request.accessToken = this.accessToken.trim();
    }

    // Call API
    this.repositoryService.addRepository(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Repository "${response.repository.name}" added successfully!`;
        
        console.log('Repository added:', response);
        
        // Redirect to repository list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/repositories/list']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to add repository. Please try again.';
        console.error('Add repository error:', error);
      }
    });
  }

  /**
   * Toggle access token field
   */
  toggleAccessToken(): void {
    this.useAccessToken = !this.useAccessToken;
    if (!this.useAccessToken) {
      this.accessToken = '';
      this.formErrors.accessToken = '';
    }
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/repositories/list']);
  }

  /**
   * Clear form
   */
  clearForm(): void {
    this.repositoryUrl = '';
    this.accessToken = '';
    this.branch = 'main';
    this.useAccessToken = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.formErrors = { url: '', accessToken: '', branch: '' };
    this.urlValidation = { isValid: false, owner: '', repo: '' };
  }

  /**
   * Handle URL input change
   */
  onUrlChange(): void {
    this.formErrors.url = '';
    this.errorMessage = '';
    
    // Validate on blur or after typing stops
    if (this.repositoryUrl) {
      this.validateUrl();
    }
  }
}

