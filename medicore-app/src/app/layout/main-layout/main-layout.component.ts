import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  sidebarOpen = signal(true);

  navItems: NavItem[] = [
    { label: 'Dashboard',     icon: 'grid',       route: '/receptionist/dashboard' },
    { label: 'Queue',         icon: 'list',        route: '/receptionist/queue' },
    { label: 'Patients',      icon: 'users',       route: '/receptionist/patients' },
    { label: 'Appointments',  icon: 'calendar',    route: '/receptionist/appointments' },
  ];

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
}
