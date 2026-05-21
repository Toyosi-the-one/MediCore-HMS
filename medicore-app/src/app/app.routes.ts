import { Routes } from '@angular/router';
import { Homepage } from './pages/homepage/homepage';
import { SignupPage } from './pages/signup-page/signup-page';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  {
    path: '',
    component: AdminDashboard,
  },
  {
    path: 'home',
    component: Homepage,
  },
  {
    path: 'signup',
    component: SignupPage,
  },
];
