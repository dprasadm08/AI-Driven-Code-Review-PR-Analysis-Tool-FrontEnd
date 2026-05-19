import { Injectable } from '@angular/core';
import { 
  Router, 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * No Auth Guard - Prevents authenticated users from accessing auth pages
 * Redirects logged-in users to dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // If user is already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      console.log('User already authenticated, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
      return false;
    }

    // User is not logged in, allow access to auth pages
    return true;
  }
}
