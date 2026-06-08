import { Component } from '@angular/core';
import { Header2 } from '../../components/header2/header2';
import { MenuBar } from '../../services/menuBar/menu-bar';
import { SideBarComponent } from '../../components/sideBar/sideBar.component';
import { UserDetailsStore } from '../../store/userDetails.store';
import { UserDetails } from '../../services/userDetails/user-details';
import { DashboardCards } from '../../components/dashboard-cards/dashboard-cards';
import { PatientsList } from '../../components/patients-list/patients-list';
import { FirestoreService } from '../../services/firestore-service/firestore.service';

@Component({
  selector: 'app-patients-page',
  imports: [Header2, SideBarComponent, DashboardCards, PatientsList],
  templateUrl: './patients.html',
  styleUrl: './patients.scss',
})
export class Patients {
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
