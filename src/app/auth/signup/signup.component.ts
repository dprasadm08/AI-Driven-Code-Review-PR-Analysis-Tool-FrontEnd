import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreeToTerms = false;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  submitted = false;

  // Form validation errors
  formErrors = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: ''
  };

  // Password strength
  passwordStrength: PasswordStrength = {
    score: 0,
    label: '',
    color: '#e1e4e8'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Validate username
   */
  validateUsername(): boolean {
    this.formErrors.username = '';

    if (!this.username || this.username.trim() === '') {
      this.formErrors.username = 'Username is required';
      return false;
    }

    if (this.username.length < 3) {
      this.formErrors.username = 'Username must be at least 3 characters';
      return false;
    }

    if (this.username.length > 20) {
      this.formErrors.username = 'Username must not exceed 20 characters';
      return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(this.username)) {
      this.formErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
      return false;
    }

    return true;
  }

  /**
   * Validate email
   */
  validateEmail(): boolean {
    this.formErrors.email = '';

    if (!this.email || this.email.trim() === '') {
      this.formErrors.email = 'Email is required';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.formErrors.email = 'Please enter a valid email address';
      return false;
    }

    return true;
  }

  /**
   * Validate password
   */
  validatePassword(): boolean {
    this.formErrors.password = '';

    if (!this.password || this.password.trim() === '') {
      this.formErrors.password = 'Password is required';
      return false;
    }

    if (this.password.length < 6) {
      this.formErrors.password = 'Password must be at least 6 characters';
      return false;
    }

    return true;
  }

  /**
   * Validate confirm password
   */
  validateConfirmPassword(): boolean {
    this.formErrors.confirmPassword = '';

    if (!this.confirmPassword || this.confirmPassword.trim() === '') {
      this.formErrors.confirmPassword = 'Please confirm your password';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.formErrors.confirmPassword = 'Passwords do not match';
      return false;
    }

    return true;
  }

  /**
   * Validate form
   */
  validateForm(): boolean {
    const usernameValid = this.validateUsername();
    const emailValid = this.validateEmail();
    const passwordValid = this.validatePassword();
    const confirmPasswordValid = this.validateConfirmPassword();

    // Check terms agreement
    if (!this.agreeToTerms) {
      this.formErrors.terms = 'You must agree to the terms and conditions';
      return false;
    } else {
      this.formErrors.terms = '';
    }

    return usernameValid && emailValid && passwordValid && confirmPasswordValid;
  }

  /**
   * Calculate password strength
   */
  calculatePasswordStrength(): void {
    if (!this.password) {
      this.passwordStrength = { score: 0, label: '', color: '#e1e4e8' };
      return;
    }

    let score = 0;
    const password = this.password;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/[0-9]/.test(password)) score++; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score++; // special chars

    // Set strength label and color
    if (score <= 2) {
      this.passwordStrength = { score, label: 'Weak', color: '#d73a49' };
    } else if (score <= 4) {
      this.passwordStrength = { score, label: 'Medium', color: '#f9826c' };
    } else if (score <= 5) {
      this.passwordStrength = { score, label: 'Strong', color: '#34d058' };
    } else {
      this.passwordStrength = { score, label: 'Very Strong', color: '#28a745' };
    }
  }

  /**
   * Handle password input change
   */
  onPasswordChange(): void {
    this.calculatePasswordStrength();
    this.formErrors.password = '';
    this.errorMessage = '';
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';
    this.submitted = true;

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.authService.register(
      this.username.trim(),
      this.email.trim().toLowerCase(),
      this.password
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting to login...';
        console.log('Registration successful:', response);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  /**
   * Clear field error on change
   */
  onFieldChange(field: keyof typeof this.formErrors): void {
    this.formErrors[field] = '';
    this.errorMessage = '';

    // Re-validate as user corrects fields after first submit attempt.
    if (this.submitted) {
      this.validateForm();
    }
  }

  hasFieldError(field: keyof typeof this.formErrors): boolean {
    return this.submitted && !!this.formErrors[field];
  }

  passwordHasMixedCase(): boolean {
    return /[a-z]/.test(this.password) && /[A-Z]/.test(this.password);
  }

  passwordHasNumber(): boolean {
    return /[0-9]/.test(this.password);
  }

  passwordHasSpecial(): boolean {
    return /[^a-zA-Z0-9]/.test(this.password);
  }
}
