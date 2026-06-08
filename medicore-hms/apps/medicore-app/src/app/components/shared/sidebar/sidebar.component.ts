import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserDetailsStore } from '../../../store/userDetails.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  userDetails: any;
  @HostBinding('class.collapsed') isCollapsed = false;
  constructor(private userDetailsStore: UserDetailsStore) {
    this.userDetails = this.userDetailsStore.userDetails();
    console.log(this.userDetails);
  }
  navItems = [
    { path: 'user/dashboard', label: 'Dashboard', icon: 'grid' },
    { path: 'user/patients', label: 'Patients', icon: 'users' },
    { path: '/appointments', label: 'Appointments', icon: 'calendar' },
    { path: '/medical-records', label: 'Medical Records', icon: 'file-text' },
    { path: '/pharmacy', label: 'Pharmacy', icon: 'package' },
  ];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
