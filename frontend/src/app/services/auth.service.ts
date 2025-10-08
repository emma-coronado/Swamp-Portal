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

  constructor(private http: HttpClient, private streamService: StreamService) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
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
    
    // Clear login status
    this.setLoginStatus(false);
    
    // Call the logout endpoint to clear the session cookie
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  // Check authentication status by making a request to the server
  checkAuthStatus(): Observable<boolean> {
    return new Observable(observer => {
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

  setLoginStatus(isLoggedIn: boolean) {
    this.isRecentLogin = isLoggedIn;
  }

  // Quick check without making HTTP request (for immediate use)
  isLoggedIn(): boolean {
    return this.isRecentLogin;
  }
}