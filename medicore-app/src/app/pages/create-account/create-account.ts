import { Component } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './create-account.html',
  styleUrl: './create-account.scss',
})
export class CreateAccount {
  constructor(
    private http: HttpClient,
    private router: Router,
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

  onSubmit() {
    console.log('Form valid:', this.userDetails.valid);
    console.log('Form errors:', this.userDetails.errors);
    console.log('Form value:', this.userDetails.value);

    if (this.userDetails.valid) {
      console.log('🚀 Sending signup request...');

      const payload = {
        firstName: this.userDetails.get('firstName')?.value,
        lastName: this.userDetails.get('lastName')?.value,
        title: this.userDetails.get('title')?.value,
        role: this.userDetails.get('role')?.value,
        email: this.userDetails.get('email')?.value,
        password: this.userDetails.get('password')?.value,
      };

      console.log('📤 Payload being sent:', payload);

      this.http.post('http://localhost:3000/firebase-auth/signup', payload).subscribe({
        next: (res: any) => {
          console.log('✅ NEXT FIRED - Success response:', res);
          alert('User created successfully! ');
          console.log(res.user);
          //this.router.navigate(['login']);
        },
        error: (err) => {
          console.error('❌ ERROR FIRED - Full error object:', err);
          console.error('❌ Error message:', err?.error?.message || err?.message);
          console.error('❌ Error details:', err?.error);
          alert('Error creating user: ' + (err?.error?.message || err?.message || 'Unknown error'));
        },
      });
    } else {
      console.log('Form is invalid. Check the console logs above.');
    }
  }
}
