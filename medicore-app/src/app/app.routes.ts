import { Routes } from '@angular/router';
import { Homepage } from './pages/homepage/homepage';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { LandingPage } from './pages/landing-page/landing-page';
import { SigninPage } from './pages/signin-page/signin-page';
import { CreateAccount } from './pages/create-account/create-account';
import { sessionCheckGuard } from './guards/session-check-guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
  {
    path: 'home',
    component: Homepage,
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [sessionCheckGuard],
  },
  {
    path: 'login',
    component: SigninPage,
  },
  {
    path: 'create-account',
    component: CreateAccount,
  },
];
