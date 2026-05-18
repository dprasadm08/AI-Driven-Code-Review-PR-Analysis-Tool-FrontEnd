import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/utils/token-storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  isLoading = false;
  returnUrl = '/dashboard';
  showPassword = false;

  // Form validation
  formErrors = {
    username: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  /**
   * Validate form fields
   */
  validateForm(): boolean {
    let isValid = true;
    this.formErrors = { username: '', password: '' };

    // Validate username
    if (!this.username || this.username.trim() === '') {
      this.formErrors.username = 'Username is required';
      isValid = false;
    } else if (this.username.length < 3) {
      this.formErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Validate password
    if (!this.password || this.password.trim() === '') {
      this.formErrors.password = 'Password is required';
      isValid = false;
    } else if (this.password.length < 6) {
      this.formErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    return isValid;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Clear previous errors
    this.errorMessage = '';

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    // Set storage type based on remember me
    this.tokenStorage.setStorageType(this.rememberMe);

    this.authService.login(this.username.trim(), this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login successful:', response);
        
        // Navigate to return URL or dashboard
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
        console.error('Login error:', error);
      }
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Clear form errors when user types
   */
  onFieldChange(field: 'username' | 'password'): void {
    this.formErrors[field] = '';
    this.errorMessage = '';
  }
}
