import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'getCurrentUser']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('should redirect to login when user is not authenticated', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    const route = { data: { roles: [UserRole.ADMIN] } } as ActivatedRouteSnapshot;
    const state = { url: '/settings' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/settings' }
    });
  });

  it('should allow when no roles are required', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    const route = { data: {} } as ActivatedRouteSnapshot;
    const state = { url: '/dashboard' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny when authenticated user has no role', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue({ username: 'alice' });

    const route = { data: { roles: [UserRole.ADMIN] } } as ActivatedRouteSnapshot;
    const state = { url: '/settings' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/errors/unauthorized']);
  });

  it('should allow when user role is in required roles', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue({ role: UserRole.USER });

    const route = { data: { roles: [UserRole.ADMIN, UserRole.USER] } } as ActivatedRouteSnapshot;
    const state = { url: '/repositories' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny when user role is not in required roles', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue({ role: UserRole.VIEWER });

    const route = { data: { roles: [UserRole.ADMIN] } } as ActivatedRouteSnapshot;
    const state = { url: '/settings' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/errors/unauthorized']);
  });
});
