import { Injectable } from '@angular/core';
import { 
  Router, 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot 
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Role Guard - Protects routes based on user roles
 * Checks if user has required role to access the route
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      console.log('User not authenticated');
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Get required roles from route data
    const requiredRoles = route.data['roles'] as Array<UserRole>;
    
    if (!requiredRoles || requiredRoles.length === 0) {
      // No specific roles required
      return true;
    }

    // Get current user
    const user = this.authService.getCurrentUser();
    
    if (!user || !user.role) {
      console.warn('User role not found');
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      console.warn(`Access denied. Required roles: ${requiredRoles.join(', ')}, User role: ${user.role}`);
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
