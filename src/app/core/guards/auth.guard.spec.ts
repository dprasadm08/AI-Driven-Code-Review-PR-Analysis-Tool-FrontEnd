import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'getCurrentUser']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow activation when user is authenticated and no role is required', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    const route = { data: {} } as ActivatedRouteSnapshot;
    const state = { url: '/dashboard' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny activation and redirect to login when user is not authenticated', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    const route = { data: {} } as ActivatedRouteSnapshot;
    const state = { url: '/repositories' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/repositories' },
      queryParamsHandling: 'merge'
    });
  });

  it('should allow activation when user has required role', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue({ role: 'ADMIN' });

    const route = { data: { roles: ['ADMIN', 'USER'] } } as ActivatedRouteSnapshot;
    const state = { url: '/settings' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny activation when role is missing and redirect unauthorized', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue({ role: 'VIEWER' });

    const route = { data: { roles: ['ADMIN'] } } as ActivatedRouteSnapshot;
    const state = { url: '/settings' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/errors/unauthorized']);
  });

  it('should apply same auth behavior for child routes', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    const route = { data: {} } as ActivatedRouteSnapshot;
    const state = { url: '/analysis/details/1' } as RouterStateSnapshot;

    const result = guard.canActivateChild(route, state);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/analysis/details/1' },
      queryParamsHandling: 'merge'
    });
  });
});
