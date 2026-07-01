import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const createToken = (exp: number): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp }));
    return `${header}.${payload}.signature`;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    sessionStorage.clear();
    localStorage.clear();

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should login and persist token/user', () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 3600);
    const user = { id: '1', username: 'alice', email: 'a@example.com' };

    service.login('alice', 'secret123').subscribe((response) => {
      expect(response.token).toBe(token);
      expect(service.getToken()).toBe(token);
      expect(service.getCurrentUser()).toEqual(user);
      expect(service.isLoggedIn()).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'alice', password: 'secret123' });
    req.flush({ token, user });
  });

  it('should fail login when username/password are missing', () => {
    service.login('', '').subscribe({
      next: () => fail('expected error'),
      error: (error: Error) => {
        expect(error.message).toBe('Username and password are required');
      }
    });

    httpMock.expectNone(`${environment.apiUrl}/auth/login`);
  });

  it('should map 401 login error message', () => {
    service.login('alice', 'wrong').subscribe({
      next: () => fail('expected error'),
      error: (error: Error) => {
        expect(error.message).toBe('Invalid username or password');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('should register successfully', () => {
    const body = {
      message: 'ok',
      user: { id: '1', username: 'alice', email: 'a@example.com' }
    };

    service.register('alice', 'a@example.com', 'secret123').subscribe((response) => {
      expect(response).toEqual(body);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'alice',
      email: 'a@example.com',
      password: 'secret123'
    });
    req.flush(body);
  });

  it('should fail register for invalid email', () => {
    service.register('alice', 'invalid-email', 'secret123').subscribe({
      next: () => fail('expected error'),
      error: (error: Error) => {
        expect(error.message).toBe('Invalid email format');
      }
    });

    httpMock.expectNone(`${environment.apiUrl}/auth/register`);
  });

  it('should fail register for short password', () => {
    service.register('alice', 'a@example.com', '123').subscribe({
      next: () => fail('expected error'),
      error: (error: Error) => {
        expect(error.message).toBe('Password must be at least 6 characters');
      }
    });

    httpMock.expectNone(`${environment.apiUrl}/auth/register`);
  });

  it('should refresh token and persist it', () => {
    const newToken = createToken(Math.floor(Date.now() / 1000) + 1800);

    service.refreshToken().subscribe((response) => {
      expect(response.token).toBe(newToken);
      expect(service.getToken()).toBe(newToken);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: newToken });
  });

  it('should return false for expired token in isLoggedIn', () => {
    const expiredToken = createToken(Math.floor(Date.now() / 1000) - 60);
    sessionStorage.setItem('ai-pr-review-token', expiredToken);

    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should clear token/user on logout', () => {
    sessionStorage.setItem('ai-pr-review-token', 'dummy.token.value');
    sessionStorage.setItem('ai-pr-review-user', JSON.stringify({ id: '1' }));

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
