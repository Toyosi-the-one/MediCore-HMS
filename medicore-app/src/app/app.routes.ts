import { Routes } from '@angular/router';
import { Homepage } from './pages/homepage/homepage';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { LandingPage } from './pages/landing-page/landing-page';
import { SigninPage } from './pages/signin-page/signin-page';
import { CreateAccount } from './pages/create-account/create-account';

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
