import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StreamService } from './stream';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  
  // DEVELOPMENT FEATURE: Allows login with admin/admin without backend API calls
  // TODO: Remove this dev workaround in production

  constructor(private http: HttpClient, private streamService: StreamService) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Development workaround: Allow admin/admin login without API call
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      console.log('Using development login workaround for admin user');
      this.setDevLoginStatus(true);
      return new Observable(observer => {
        // Simulate successful login response
        setTimeout(() => {
          observer.next({ status: 'ok' });
          observer.complete();
        }, 500); // Small delay to simulate network request
      });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Include credentials to handle HTTP-only cookies
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials, { 
      headers,
      withCredentials: true 
    });
  }

  // Since we're using HTTP-only cookies, we don't store tokens in localStorage
  // Instead, we'll rely on the session cookie for authentication

  logout(): Observable<any> {
    // Disconnect stream before logout
    this.streamService.disconnect();
    
    // Check if using dev login before clearing the status
    const wasDevLogin = this.isDevLoginActive;
    
    // Clear login status
    this.setLoginStatus(false);
    this.setDevLoginStatus(false);
    
    // If using dev login, don't call the API
    if (wasDevLogin) {
      return new Observable(observer => {
        observer.next({});
        observer.complete();
      });
    }
    
    // Call the logout endpoint to clear the session cookie
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  // Check authentication status by making a request to the server
  checkAuthStatus(): Observable<boolean> {
    return new Observable(observer => {
      // If using development login, skip server check
      if (this.isDevLoginActive) {
        observer.next(true);
        observer.complete();
        return;
      }

      // Try to make a request to a protected endpoint to verify authentication
      this.http.get(`${this.apiUrl}/auth/status`, { withCredentials: true })
        .subscribe({
          next: (response) => {
            // If the request succeeds, user is authenticated
            observer.next(true);
            observer.complete();
          },
          error: (error) => {
            // If the request fails (401, 403), user is not authenticated
            if (error.status === 401 || error.status === 403) {
              observer.next(false);
            } else {
              // For other errors, assume not authenticated to be safe
              observer.next(false);
            }
            observer.complete();
          }
        });
    });
  }

  // Simple method to check if user is likely authenticated based on recent login
  private isRecentLogin = false;
  private isDevLoginActive = false;

  setLoginStatus(isLoggedIn: boolean) {
    this.isRecentLogin = isLoggedIn;
  }

  private setDevLoginStatus(isActive: boolean) {
    this.isDevLoginActive = isActive;
  }

  // Quick check without making HTTP request (for immediate use)
  isLoggedIn(): boolean {
    return this.isRecentLogin;
  }
}