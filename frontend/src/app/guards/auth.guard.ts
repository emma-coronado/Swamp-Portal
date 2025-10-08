import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // First check if user recently logged in (quick check)
    if (this.authService.isLoggedIn()) {
      return of(true);
    }

    // If not, verify with server
    return this.authService.checkAuthStatus().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          this.authService.setLoginStatus(true);
          return true;
        } else {
          // User is not authenticated, redirect to login
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(() => {
        // On error, assume not authenticated and redirect to login
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}