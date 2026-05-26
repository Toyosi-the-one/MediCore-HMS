import { Component } from '@angular/core';
//import { RouterLink } from "@angular/router";
import {
  FormsModule,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'app-signin-page',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './signin-page.html',
  styleUrl: './signin-page.scss',
})
export class SigninPage {
  constructor(private auth: AuthService) {}
  loginDetails = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  Googlelogin() {
    this.auth.Googlelogin();
  }
  // onSubmit() {
  //   if (this.loginDetails.valid) {
  //     const user = this.loginDetails.getRawValue();
  //     console.log(user)
  //     this.auth.login(user);
  //   }
  // }
}
