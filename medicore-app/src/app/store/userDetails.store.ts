// services/userDetails/user-details.store.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserDetailsStore {
  private _userDetails = signal<any>(null);

  readonly userDetails = this._userDetails.asReadonly();

  set(data: any) {
    this._userDetails.set(data);
    // console.log('User details updated in store:', this._userDetails());
  }


  clear() {
    this._userDetails.set(null);
  }
}
