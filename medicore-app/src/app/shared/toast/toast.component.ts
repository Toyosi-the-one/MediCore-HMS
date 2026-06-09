import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts" class="toast" [ngClass]="t.type">
        <div class="toast-message">{{ t.message }}</div>
      </div>
    </div>
  `,
  styles: [
    `.toast-container { position: fixed; right: 16px; top: 16px; z-index: 9999; display:flex; flex-direction:column; gap:8px }
     .toast { background:white; border-radius:8px; padding:10px 14px; box-shadow:0 6px 18px rgba(2,6,23,0.08); min-width:200px }
     .toast.success { border-left:4px solid #22c55e }
     .toast.error { border-left:4px solid #ef4444 }
    `
  ]
})
export class ToastComponent implements OnInit {
  toasts: Array<{ message: string; type?: 'success' | 'error' }> = [];

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.toast.toasts$.subscribe(t => {
      this.toasts = [...this.toasts, t];
      setTimeout(() => this.toasts = this.toasts.filter(x => x !== t), 4000);
    });
  }
}
