import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { UserDetails } from '../services/userDetails/user-details';
import { UserDetailsStore } from '../store/userDetails.store';

export const userDetailsResolver: ResolveFn<any> = async () => {
  const userService = inject(UserDetails);
  const store = inject(UserDetailsStore);
  const router = inject(Router);

  try {
    // 1. CHECK STORE FIRST
    const storeData = store.userDetails();
    if (storeData) {
      return storeData;
    }

    // 2. CHECK SESSION STORAGE
    const cached = sessionStorage.getItem('userDetails');

    if (cached) {
      const data = JSON.parse(cached);
      store.set(data);
      return data;
    }

    // 3. FALLBACK → API CALL
    const data = await userService.getUserDetails();

    store.set(data);
    sessionStorage.setItem('userDetails', JSON.stringify(data));

    return data;

  } catch (error) {
    router.navigate(['/login']);
    return null;
  }
};