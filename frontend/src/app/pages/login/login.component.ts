import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
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
    
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      console.log('Login attempt:', username, password);
      // TODO: Add authentication logic or call your backend here
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
