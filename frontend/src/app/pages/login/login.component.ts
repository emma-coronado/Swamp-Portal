import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { StreamService } from '../../services/stream';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService,
    private streamService: StreamService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  // Get error message for username field
  getUsernameError(): string {
    const usernameControl = this.loginForm.get('username');
    if (!usernameControl?.errors || !usernameControl?.touched) return '';

    if (usernameControl.errors['required']) {
      return 'Username is required';
    }
    return '';
  }

  // Get error message for password field
  getPasswordError(): string {
    const passwordControl = this.loginForm.get('password');
    if (!passwordControl?.errors || !passwordControl?.touched) return '';

    if (passwordControl.errors['required']) {
      return 'Password is required';
    }
    return '';
  }

  // Check if field is invalid and touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  onLogin() {
    this.submitted = true;
    this.errorMessage = '';
    
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials: LoginRequest = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      };
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Login response:', response);
          
          // Backend returns { "status": "ok" } on successful login
          if (response && response.status === 'ok') {
            console.log('Login successful! Starting stream connection...');
            
            console.log('Redirecting to home...');
            this.router.navigate(['/home']).then(() => {
              // Start stream connection after navigation completes
              console.log('Navigation complete, starting stream connection...');
              this.streamService.connect().then(() => {
                console.log('✅ Stream connection established after navigation');
              }).catch((error) => {
                console.error('❌ Failed to establish stream connection:', error);
                // Stream failure doesn't affect the app
              });
            });
          } else {
            this.errorMessage = 'Login failed. Please check your credentials.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password.';
          } else if (error.status === 0) {
            this.errorMessage = 'Unable to connect to the server. Please check if the server is running.';
          } else {
            this.errorMessage = error.error?.message || 'An error occurred during login. Please try again.';
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
