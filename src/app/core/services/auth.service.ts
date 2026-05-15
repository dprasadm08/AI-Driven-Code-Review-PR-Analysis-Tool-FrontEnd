import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../utils/token-storage';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenStorage = new TokenStorageService();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/login`,
      { username, password },
      httpOptions
    ).pipe(
      tap((response: any) => {
        if (response.token) {
          this.tokenStorage.saveToken(response.token);
          this.tokenStorage.saveUser(response.user);
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/register`,
      { username, email, password },
      httpOptions
    );
  }

  logout(): void {
    this.tokenStorage.signOut();
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  getCurrentUser(): any {
    return this.tokenStorage.getUser();
  }
}
