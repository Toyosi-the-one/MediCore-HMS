import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="doctor-profile" #root>
      <div class="avatar">D</div>
      <div class="info">
        <div class="name">Dr. Adams</div>
        <div class="meta">General Physician</div>
      </div>
      <div class="actions">
        <button class="btn" (click)="toggle($event)">▼</button>
        <div class="dropdown" *ngIf="open">
          <a class="dropdown-item">View Profile</a>
          <a class="dropdown-item">Settings</a>
          <a class="dropdown-item">Logout</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.doctor-profile{display:flex;align-items:center;gap:10px;position:relative}
     .avatar{width:40px;height:40px;border-radius:50%;background:#1e3a8a;color:#fff;display:flex;align-items:center;justify-content:center}
     .name{font-weight:600}
     .meta{font-size:0.8rem;color:#6b7280}
     .actions{position:relative}
     .btn{background:transparent;border:none;color:#1f2937;cursor:pointer}
     .dropdown{position:absolute;right:0;top:44px;background:#fff;border-radius:8px;box-shadow:0 6px 18px rgba(2,6,23,0.08);overflow:hidden}
     .dropdown-item{display:block;padding:8px 12px;color:#0f172a;text-decoration:none;cursor:pointer}
     .dropdown-item:hover{background:#f1f5f9}
    `
  ]
})
export class DoctorProfileComponent {
  open = false;

  constructor(private el: ElementRef) {}

  toggle(event: Event) {
    event.stopPropagation();
    this.open = !this.open;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.el.nativeElement.contains(target)) {
      this.open = false;
    }
  }
}
