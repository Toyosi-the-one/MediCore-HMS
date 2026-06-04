import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserDetailsStore } from '../../store/userDetails.store';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  store = inject(UserDetailsStore);
  public userDetails = this.store.userDetails();
  // constructor() {
  //   console.log(this.userDetails);
  // }
  public firstLetter = this.userDetails?.displayName.charAt(0).toUpperCase() || '';
  sidebarOpen = signal(true);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'grid', route: '/user/dashboard' },
    { label: 'Queue', icon: 'list', route: '/user/queue' },
    { label: 'Patients', icon: 'users', route: '/user/patients' },
    { label: 'Appointments', icon: 'calendar', route: '/user/appointments' },
  ];

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }
}
