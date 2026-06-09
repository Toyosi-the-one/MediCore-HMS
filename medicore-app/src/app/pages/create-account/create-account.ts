import { Component, ChangeDetectorRef } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth-service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Payload {
  displayName: string | null;
  title: string | null;
  role: string | null;
  email: string | null;
  password: string | null;
}

@Component({
  selector: 'app-create-account',
  imports: [FormsModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './create-account.html',
  styleUrl: './create-account.scss',
})
export class CreateAccount {
  isLoading = false;

  constructor(
    public AuthService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };

  public userDetails = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator },
  );

  async onSubmit() {
    if (this.userDetails.invalid) {
      this.userDetails.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    if (this.isLoading) {
      console.log('This is loading =true');
    }
    this.cdr.detectChanges(); // Force UI update

    const payload: Payload = {
      displayName: `${this.userDetails.get('firstName')!.value} ${this.userDetails.get('lastName')!.value}`,
      title: this.userDetails.get('title')!.value,
      role: this.userDetails.get('role')!.value?.toLowerCase() ?? null,
      email: this.userDetails.get('email')!.value,
      password: this.userDetails.get('password')!.value,
    };

    try {
      await this.AuthService.createUserWithEmailAndPassword(payload);
      console.log('✅ Account created successfully!');
      
      // Add navigation here if needed
    } catch (error) {
      console.error('❌ Registration failed:', error);
      // TODO: Show error message to user
    } finally {
      // Minimum 800ms loading time so user can see the spinner
      await new Promise((resolve) => setTimeout(resolve, 800));
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
