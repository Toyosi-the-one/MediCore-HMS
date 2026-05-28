import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

export const sessionCheckGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http
    .get<{ cookie: boolean }>(`${environment.apiURL}/session`, {
      withCredentials: true,
    })
    .pipe(
      map((res) => {
        if (res.cookie) {
          return true;
        }
        alert('You are not logged in');
        router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        alert('There was an error, Please log in again');
        router.navigate(['/login']);
        return of(false);
      }),
    );
};
