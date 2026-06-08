import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../services/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  imports: [NgClass],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-card" [ngClass]="'toast-' + toast.type">
          <!-- Icon -->
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            } @else if (toast.type === 'error') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            }
          </div>
          
          <!-- Content -->
          <div class="toast-content">
            <h4 class="toast-title">{{ toast.title }}</h4>
            @if (toast.message) {
              <p class="toast-message">{{ toast.message }}</p>
            }
          </div>

          <!-- Close -->
          <button class="toast-close" (click)="toastService.remove(toast.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      width: 320px;
      padding: 16px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03);
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border-left: 4px solid;
    }

    .toast-success { border-color: #10B981; .toast-icon { color: #10B981; } }
    .toast-error { border-color: #EF4444; .toast-icon { color: #EF4444; } }
    .toast-info { border-color: #3B82F6; .toast-icon { color: #3B82F6; } }

    .toast-icon {
      margin-top: 2px;
      flex-shrink: 0;
    }

    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .toast-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #0F0E2C;
    }

    .toast-message {
      margin: 0;
      font-size: 13px;
      color: #64748B;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      padding: 2px;
      flex-shrink: 0;
      border-radius: 4px;
      transition: all 0.2s;
      
      &:hover {
        background: #F1F5F9;
        color: #0F0E2C;
      }
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
