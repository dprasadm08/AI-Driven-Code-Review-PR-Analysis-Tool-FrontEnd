import { Injectable } from '@angular/core';
import { 
  Router, 
  CanActivate, 
  CanActivateChild,
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes from unauthorized access
 * Implements CanActivate and CanActivateChild for comprehensive route protection
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Determines if a route can be activated
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url, route);
  }

  /**
   * Determines if child routes can be activated
   */
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url, childRoute);
  }

  /**
   * Check authentication and authorization
   */
  private checkAuth(url: string, route: ActivatedRouteSnapshot): boolean {
    // Check if user is logged in
    if (this.authService.isLoggedIn()) {
      // Check if route requires specific roles
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles && requiredRoles.length > 0) {
        const user = this.authService.getCurrentUser();
        const userRole = user?.role;
        
        if (!userRole || !requiredRoles.includes(userRole)) {
          console.warn('Access denied: Insufficient permissions');
          this.router.navigate(['/errors/unauthorized']);
          return false;
        }
      }
      
      // User is authenticated and authorized
      return true;
    }

    // User is not logged in
    console.log('User not authenticated, redirecting to login');
    
    // Store the attempted URL for redirecting after login
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: url },
      queryParamsHandling: 'merge'
    });
    
    return false;
  }
}

