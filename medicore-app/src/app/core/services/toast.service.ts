import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private idCounter = 0;

  show(type: ToastType, title: string, message?: string, duration = 4000) {
    const id = this.idCounter++;
    this.toasts.update(t => [...t, { id, type, title, message }]);
    
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(title: string, message?: string, duration = 4000) { this.show('success', title, message, duration); }
  error(title: string, message?: string, duration = 6000) { this.show('error', title, message, duration); }
  info(title: string, message?: string, duration = 4000) { this.show('info', title, message, duration); }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
