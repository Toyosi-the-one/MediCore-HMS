// MediCore HMS — Receptionist Module Routes
import { Routes } from '@angular/router';
import { Homepage } from './pages/homepage/homepage';
import { LandingPage } from './pages/landing-page/landing-page';
import { SigninPage } from './pages/signin-page/signin-page';
import { CreateAccount } from './pages/create-account/create-account';

import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Patients } from './pages/patients/patients';

import { sessionCheckGuard } from './guards/session-check-guard';
import { userDetailsResolver } from './resolvers/userDetails-resolvers';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  // -------------------
  // PUBLIC ROUTES
  // -------------------
  { path: '', redirectTo: '/receptionist/dashboard', pathMatch: 'full' },

  {
    path: 'landing',
    component: LandingPage,
  },
  {
    path: 'home',
    component: Homepage,
  },
  {
    path: 'login',
    component: SigninPage,
  },
  {
    path: 'create-account',
    component: CreateAccount,
  },

  // -------------------
  // PROTECTED ROUTES
  // -------------------
  {
    path: '',
    canActivate: [sessionCheckGuard],
    resolve: { userDetails: userDetailsResolver },
    children: [
      {
        path: 'admin',
        component: AdminDashboard,
      },
      {
        path: 'patients',
        component: Patients,
      },
    ],
  },

  // Redirect root to receptionist dashboard

  // All receptionist pages live inside the main layout shell
  {
    path: 'receptionist',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/receptionist/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'queue',
        loadComponent: () =>
          import('./features/receptionist/queue-dashboard/queue-dashboard.component').then(
            (m) => m.QueueDashboardComponent,
          ),
      },
      {
        path: 'patients/new',
        loadComponent: () =>
          import('./features/receptionist/patient-registration/patient-registration.component').then(
            (m) => m.PatientRegistrationComponent,
          ),
      },
      {
        path: 'patients/edit/:id',
        loadComponent: () =>
          import('./features/receptionist/edit-patient/edit-patient.component').then(
            (m) => m.EditPatientComponent,
          ),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/receptionist/patient-list/patient-list.component').then(
            (m) => m.PatientListComponent,
          ),
      },
      {
        path: 'appointments/new',
        loadComponent: () =>
          import('./features/receptionist/schedule-appointment/schedule-appointment.component').then(
            (m) => m.ScheduleAppointmentComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/receptionist/appointment-list/appointment-list.component').then(
            (m) => m.AppointmentListComponent,
          ),
      },
      // Default child
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Patient Portal entry screen — standalone (no layout shell).
  // pathMatch:'full' ensures this only matches the bare /patient path,
  // leaving /patient/* to be matched by the layout route below.
  {
    path: 'patient',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/patient/patient-entry/patient-entry.component').then(
        (m) => m.PatientEntryComponent,
      ),
  },

  // Patient Portal protected area — layout shell + child routes.
  // Angular resolves /patient to the entry above (pathMatch:'full');
  // all deeper paths like /patient/dashboard fall through to this route.
  {
    path: 'patient',
    loadComponent: () =>
      import('./layout/patient-layout/patient-layout.component').then(
        (m) => m.PatientLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/patient/patient-dashboard/patient-dashboard.component').then(
            (m) => m.PatientDashboardComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/patient/patient-appointments/patient-appointments.component').then(
            (m) => m.PatientAppointmentsComponent,
          ),
      },
      {
        path: 'book',
        loadComponent: () =>
          import('./features/patient/patient-book/patient-book.component').then(
            (m) => m.PatientBookComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/patient/patient-profile/patient-profile.component').then(
            (m) => m.PatientProfileComponent,
          ),
      },
    ],
  },

  // Catch-all
  // { path: '**', redirectTo: '/receptionist/dashboard' },
];
