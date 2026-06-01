import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

export const sessionCheckGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http
    .get<{ success: boolean }>(`${environment.apiURL}/session`, {
      withCredentials: true,
    })
    .pipe(
      map((res) => {
        if (res.success === true) {
          console.log(false);
          return true;
        }
        return router.createUrlTree(['/login']); // ✅ let the router handle it
      }),
      catchError((err) => {
        console.error('Session check failed:', err); // ✅ use console, not alert
        return of(router.createUrlTree(['/login'])); // ✅ same here
      }),
    );
};
