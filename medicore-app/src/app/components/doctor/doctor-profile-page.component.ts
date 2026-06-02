import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { Doctor } from '../../models/doctor.model';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-doctor-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container doctor-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Doctor Profile</h1>
          <p class="page-subtitle">Essential information about the care team leader.</p>
        </div>
        <a routerLink="/dashboard" class="btn btn-outline">Back to Dashboard</a>
      </div>

      <section class="profile-card">
        <div class="profile-summary">
          <div class="profile-avatar">DR</div>
          <div class="profile-meta">
            <ng-container *ngIf="!editMode; else editHeader">
              <h2>{{ doctor.name }}</h2>
              <p class="subtitle">{{ doctor.title }} — {{ doctor.specialization }}</p>
              <div class="tag">Board Certified</div>
            </ng-container>
            <ng-template #editHeader>
              <div class="edit-header-grid">
                <div>
                  <label>Full Name</label>
                  <input type="text" [(ngModel)]="doctor.name" />
                </div>
                <div>
                  <label>Specialization</label>
                  <input type="text" [(ngModel)]="doctor.specialization" />
                </div>
              </div>
            </ng-template>
          </div>
          <div class="profile-stats">
            <div>
              <span>{{ doctor.experience }}</span>
              <small>Years Experience</small>
            </div>
            <div>
              <span>{{ doctor.patientsManaged }}</span>
              <small>Patients Managed</small>
            </div>
          </div>
        </div>

        <div class="profile-details-grid">
          <div class="detail-item">
            <span class="detail-label">Full Name</span>
            <span *ngIf="!editMode">{{ doctor.name }}</span>
            <input *ngIf="editMode" type="text" [(ngModel)]="doctor.name" />
          </div>
          <div class="detail-item">
            <span class="detail-label">Specialization</span>
            <span *ngIf="!editMode">{{ doctor.specialization }}</span>
            <input *ngIf="editMode" type="text" [(ngModel)]="doctor.specialization" />
          </div>
          <div class="detail-item">
            <span class="detail-label">Sex</span>
            <span *ngIf="!editMode">{{ doctor.sex }}</span>
            <select *ngIf="editMode" [(ngModel)]="doctor.sex">
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </div>
          <div class="detail-item">
            <span class="detail-label">Phone</span>
            <span *ngIf="!editMode">{{ doctor.phone }}</span>
            <input *ngIf="editMode" type="text" [(ngModel)]="doctor.phone" />
          </div>
          <div class="detail-item">
            <span class="detail-label">Email</span>
            <span *ngIf="!editMode">{{ doctor.email }}</span>
            <input *ngIf="editMode" type="email" [(ngModel)]="doctor.email" />
          </div>
          <div class="detail-item">
            <span class="detail-label">License</span>
            <span *ngIf="!editMode">{{ doctor.license }}</span>
            <input *ngIf="editMode" type="text" [(ngModel)]="doctor.license" />
          </div>
          <div class="detail-item detail-span">
            <span class="detail-label">Address</span>
            <span *ngIf="!editMode">{{ doctor.address }}</span>
            <input *ngIf="editMode" type="text" [(ngModel)]="doctor.address" />
          </div>
          <div class="detail-item detail-span">
            <span class="detail-label">About</span>
            <span *ngIf="!editMode">{{ doctor.about }}</span>
            <textarea *ngIf="editMode" rows="4" [(ngModel)]="doctor.about"></textarea>
          </div>
        </div>

        <div class="profile-actions">
          <a class="btn btn-outline" routerLink="/patients">View Patients</a>
          <button class="btn btn-primary" *ngIf="!editMode" (click)="toggleEdit()">Edit Profile</button>
          <ng-container *ngIf="editMode">
            <button class="btn btn-outline" (click)="cancelEdit()">Cancel</button>
            <button class="btn btn-primary" (click)="save()">Save Changes</button>
          </ng-container>
        </div>
      </section>
    </div>
  `,
  styles: [
    `.doctor-page { padding: 24px; background: #f8fafc; }
     .profile-card { background: #ffffff; border-radius: 24px; padding: 28px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06); border: 1px solid rgba(148, 163, 184, 0.15); }
     .profile-summary { display: grid; grid-template-columns: auto 1fr auto; gap: 24px; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; }
     .profile-avatar { width: 96px; height: 96px; border-radius: 24px; background: linear-gradient(135deg, #0f172a, #2563eb); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; }
     .profile-meta h2 { margin: 0; font-size: 1.75rem; color: #0f172a; }
     .subtitle { margin: 8px 0 0; color: #475569; font-size: 0.95rem; }
     .tag { display: inline-flex; margin-top: 12px; padding: 8px 12px; border-radius: 999px; background: #e0f2fe; color: #0c4a6e; font-size: 0.8rem; font-weight: 600; }
     .edit-header-grid { display: grid; grid-template-columns: repeat(2, minmax(160px, 1fr)); gap: 16px; }
     .edit-header-grid label { display: block; margin-bottom: 6px; color: #475569; font-size: 0.85rem; }
     .edit-header-grid input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 12px; background: #f8fafc; }
     .profile-stats { display: grid; grid-template-columns: repeat(2, minmax(120px, 1fr)); gap: 12px; }
     .profile-stats div { padding: 16px; border-radius: 18px; background: #f8fafc; text-align: center; border: 1px solid #e2e8f0; }
     .profile-stats span { display: block; font-size: 1.4rem; font-weight: 700; color: #0f172a; }
     .profile-stats small { color: #64748b; }
     .profile-details-grid { display: grid; grid-template-columns: repeat(2, minmax(200px, 1fr)); gap: 18px; margin-top: 28px; }
     .detail-item { display: grid; gap: 8px; padding: 18px; border-radius: 18px; background: #f8fafc; border: 1px solid #e2e8f0; }
     .detail-span { grid-column: 1 / -1; }
     .detail-label { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
     .detail-item span:last-child { color: #0f172a; font-weight: 600; }
     .detail-item input,
     .detail-item textarea,
     .detail-item select { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 12px; background: #fff; color: #0f172a; }
     .detail-item input:focus,
     .detail-item textarea:focus,
     .detail-item select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
     .profile-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 26px; }
     .btn { border-radius: 999px; padding: 10px 18px; font-weight: 600; letter-spacing: 0.01em; }
     .btn-outline { border: 1px solid #cbd5e1; background: transparent; color: #0f172a; }
     .btn-primary { background: #2563eb; color: #fff; border: none; }
     @media (max-width: 860px) { .profile-summary { grid-template-columns: 1fr; text-align: center; } .profile-stats { grid-template-columns: 1fr; } .profile-details-grid { grid-template-columns: 1fr; } .profile-actions { flex-direction: column; align-items: stretch; }
     }
    `
  ]
})
export class DoctorProfilePageComponent implements OnInit {
  editMode = false;
  doctorId = 'main';
  originalDoctor: Doctor = {
    name: 'Dr. Adams',
    title: 'Chief Physician',
    specialization: 'Internal Medicine',
    sex: 'Female',
    phone: '+1 555-0100',
    email: 'dr.adams@medicore.local',
    license: 'LIC-2021-9988',
    address: '12 Health Avenue, Suite 400, Cityville',
    about: 'Experienced physician with a background in internal medicine, hospital care coordination, and chronic disease management.',
    experience: 15,
    patientsManaged: 1280
  };

  doctor: Doctor = { ...this.originalDoctor };

  constructor(private doctorService: DoctorService, private toast: ToastService) {}

  ngOnInit(): void {
    this.doctorService.getDoctor(this.doctorId)
      .then(doc => {
        if (doc) {
          this.originalDoctor = { ...this.originalDoctor, ...doc };
          this.doctor = { ...this.originalDoctor };
        } else {
          this.doctorService.saveDoctor(this.doctorId, this.originalDoctor).catch(console.error);
        }
      })
      .catch(console.error);
  }

  toggleEdit(): void {
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.doctor = { ...this.originalDoctor };
  }

  save(): void {
    this.doctorService.saveDoctor(this.doctorId, this.doctor)
      .then(() => {
        this.originalDoctor = { ...this.doctor };
        this.editMode = false;
        this.toast.show('Doctor profile updated', 'success');
      })
      .catch(error => {
        console.error(error);
        this.toast.show('Failed to save profile', 'error');
      });
  }
}
