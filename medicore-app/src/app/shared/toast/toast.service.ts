import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = new Subject<{ message: string; type?: 'success' | 'error' }>();
  toasts$ = this.toasts.asObservable();

  show(message: string, type: 'success' | 'error' = 'success') {
    this.toasts.next({ message, type });
  }
}
