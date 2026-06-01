import { Component, ChangeDetectorRef } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormsModule,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth-service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signin-page',
  imports: [NgIf, FormsModule, ReactiveFormsModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './signin-page.html',
  styleUrl: './signin-page.scss',
})
export class SigninPage {
  isLoading = false;
  errorMessage = '';

  emptyEmail = false;
  emptyPassword = false;
  invalidEmail = false;
  showRole = false;

  constructor(
    public auth: AuthService,
    private cdr: ChangeDetectorRef, // ← Add this
  ) {}

  loginDetails = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  async login() {
    // Reset errors
    this.errorMessage = '';
    this.emptyEmail = false;
    this.emptyPassword = false;
    this.invalidEmail = false;

    const emailControl = this.loginDetails.get('email');
    const passwordControl = this.loginDetails.get('password');

    // Set field error flags
    if (emailControl?.hasError('required')) this.emptyEmail = true;
    if (passwordControl?.hasError('required')) this.emptyPassword = true;
    if (emailControl?.hasError('email') && !emailControl.hasError('required')) {
      this.invalidEmail = true;
    }

    if (this.loginDetails.invalid) {
      this.loginDetails.markAllAsTouched();
      this.cdr.detectChanges(); // ← Refresh UI
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges(); // ← Refresh UI immediately

    try {
      await this.auth.signIn({
        email: emailControl!.value,
        password: passwordControl!.value,
      });

      console.log('✅ Login successful');
    } catch (error: any) {
      console.error('❌ Login failed:', error);

      if (
        error.code?.includes('wrong-password') ||
        error.code?.includes('invalid-credential') ||
        error.code?.includes('user-not-found')
      ) {
        this.errorMessage = 'Incorrect email or password';
      } else {
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // ← Ensure UI updates after loading
    }
  }

  // Google login also updated
  async Googlelogin() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      await this.auth.signInWithGoogle();
    } catch (error: any) {
      this.errorMessage = 'Google sign in failed. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
