import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'doctor',
    loadComponent: () => import('./components/doctor/doctor-profile-page.component').then(m => m.DoctorProfilePageComponent)
  },
  {
    path: 'patients/:id',
    loadComponent: () => import('./components/patients/patient-detail.component').then(m => m.PatientDetailComponent)
  },
  {
    path: 'patients',
    loadComponent: () => import('./components/patients/patients.component').then(m => m.PatientsComponent)
  },
  {
    path: 'appointments',
    loadComponent: () => import('./components/appointments/appointments.component').then(m => m.AppointmentsComponent)
  },
  {
    path: 'medical-records',
    loadComponent: () => import('./components/medical-records/medical-records.component').then(m => m.MedicalRecordsComponent)
  },
  {
    path: 'pharmacy',
    loadComponent: () => import('./components/pharmacy/pharmacy.component').then(m => m.PharmacyComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
