import { Component } from '@angular/core';
import { Header2 } from '../../components/header2/header2';
import { MenuBar } from '../../services/menuBar/menu-bar';
import { SideBarComponent } from '../../components/sideBar/sideBar.component';
import { UserDetailsStore } from '../../store/userDetails.store';
import { UserDetails } from '../../services/userDetails/user-details';
import { DashboardCards } from "../../components/dashboard-cards/dashboard-cards";

@Component({
  selector: 'app-admin-dashboard',
  imports: [Header2, SideBarComponent, DashboardCards],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  userInfo: any;
  currentDate: any;

  constructor(
    public menu: MenuBar,
    public store: UserDetailsStore,
    public user: UserDetails,
  ) {
    this.userInfo = this.store.userDetails();
    this.currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
