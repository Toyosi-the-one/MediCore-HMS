import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDetails {
  constructor(
    public http: HttpClient,
    public router: Router,
  ) {}
  async getUserDetails() {
    const userInfo = await firstValueFrom(
      this.http.get(`${environment.apiURL}/firebase-auth/me`, { withCredentials: true }),
    );
    if (userInfo) {
      return userInfo;
    } else {
      alert('Error logging you in , please try again');
      this.router.navigate(['/login']);
      throw new Error('Failed to fetch user details');
    }
  }
}
