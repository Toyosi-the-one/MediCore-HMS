// MediCore HMS — Receptionist Module Routes
import { Routes } from '@angular/router';
import { sessionCheckGuard } from './guards/session-check-guard';
import { userDetailsResolver } from './resolvers/userDetails-resolvers';

export const routes: Routes = [
  // -------------------
  // PUBLIC ROUTES
  // -------------------
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
  // {
  //   path: 'home',
  //   loadComponent: () => import('./pages/homepage/homepage').then((m) => m.Homepage),
  // },
  {
    path: 'login',
    loadComponent: () => import('./pages/signin-page/signin-page').then((m) => m.SigninPage),
  },
  {
    path: 'create-account',
    loadComponent: () =>
      import('./pages/create-account/create-account').then((m) => m.CreateAccount),
  },

  // -------------------
  // PROTECTED ROUTES
  // -------------------
  {
    path: '',
    canActivate: [sessionCheckGuard],
    resolve: { userDetails: userDetailsResolver },
    children: [
      // {
      //   path: 'admin',
      //   loadComponent: () =>
      //     import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      // },
      // {
      //   path: 'patients',
      //   loadComponent: () => import('./pages/patients/patients').then((m) => m.Patients),
      // },
      {
        path: 'user',
        loadComponent: () =>
          import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
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
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

          // Patient Portal entry screen — standalone (no layout shell).
          // pathMatch:'full' ensures this only matches the bare /patient path,
          // leaving /patient/* to be matched by the layout route below.
          // {
          //   path: 'patient',
          //   pathMatch: 'full',
          //   loadComponent: () =>
          //     import('./features/patient/patient-entry/patient-entry.component').then(
          //       (m) => m.PatientEntryComponent,
          //     ),
          // },

          // Patient Portal protected area — layout shell + child routes.
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
          { path: '**', redirectTo: 'dashboard' },
        ],
      },

      // All receptionist pages live inside the main layout shell
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboarddavid',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'doctordavid',
        loadComponent: () =>
          import('./components/doctor/doctor-profile-page.component').then(
            (m) => m.DoctorProfilePageComponent,
          ),
      },
      // {
      //   path: 'patients/:id',
      //   loadComponent: () =>
      //     import('./components/patients/patient-detail.component').then(
      //       (m) => m.PatientDetailComponent,
      //     ),
      // },
      // {
      //   path: 'patients',
      //   loadComponent: () =>
      //     import('./components/patients/patients.component').then((m) => m.PatientsComponent),
      // },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./components/appointments/appointments.component').then(
            (m) => m.AppointmentsComponent,
          ),
      },
      {
        path: 'medical-records',
        loadComponent: () =>
          import('./components/medical-records/medical-records.component').then(
            (m) => m.MedicalRecordsComponent,
          ),
      },
      {
        path: 'pharmacy',
        loadComponent: () =>
          import('./components/pharmacy/pharmacy.component').then((m) => m.PharmacyComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
