import { Routes } from '@angular/router';
import { Homepage } from './pages/homepage/homepage';
import { LandingPage } from './pages/landing-page/landing-page';
import { SigninPage } from './pages/signin-page/signin-page';
import { CreateAccount } from './pages/create-account/create-account';

import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Patients } from './pages/patients/patients';

import { sessionCheckGuard } from './guards/session-check-guard';
import { userDetailsResolver } from './resolvers/userDetails-resolvers';

export const routes: Routes = [
  // -------------------
  // PUBLIC ROUTES
  // -------------------
  {
    path: '',
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
];
