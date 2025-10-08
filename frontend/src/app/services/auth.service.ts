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
    
    // Call the logout endpoint to clear the session cookie
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  // For cookie-based authentication, we can't directly check the cookie from JS
  // We'll need to make a request to check authentication status
  checkAuthStatus(): Observable<boolean> {
    // This would require an endpoint like /api/auth/status
    // For now, we'll assume the user is authenticated if they successfully logged in
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }
}