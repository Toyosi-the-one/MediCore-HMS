import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { ReceptionistService } from '../../../core/services/receptionist.service';
import { DOCTORS_BY_DEPT } from '../../../core/data/appointment.config';
import { UserDetailsStore } from '../../../store/userDetails.store';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  // public userDetails: any;
  private receptionistService = inject(ReceptionistService);
  store = inject(UserDetailsStore);
  public userDetails = this.store.userDetails();
  constructor() {
    console.log(this.userDetails.role);
  }
  today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  private todayISO = new Date().toISOString().split('T')[0];

  isLoading = this.receptionistService.isLoading;
  stats = this.receptionistService.queueStats;

  // Next in line: The first 5 patients in 'Waiting' status for today
  nextInLine = computed(() => {
    return this.receptionistService
      .queue()
      .filter((e) => e.appointmentDate === this.todayISO && e.status === 'Waiting')
      .slice(0, 5);
  });

  // Derived from the shared config — one doctor per department
  // Status is indicative only (no live doctor status system yet)
  doctorsOnDuty = Object.entries(DOCTORS_BY_DEPT).map(([dept, doctors]) => ({
    department: dept,
    doctor: doctors[0],
    status: 'Available' as 'Available' | 'Busy' | 'On Break',
  }));
}
