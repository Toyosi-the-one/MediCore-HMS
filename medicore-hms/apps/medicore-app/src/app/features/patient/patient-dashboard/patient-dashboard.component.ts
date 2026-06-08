import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, UpperCasePipe, LowerCasePipe } from '@angular/common';
import { PatientSessionService } from '../../../core/services/patient-session.service';
import { ReceptionistService, QueueEntry } from '../../../core/services/receptionist.service';

@Component({
  selector: 'app-patient-dashboard',
  imports: [RouterLink, DatePipe, UpperCasePipe, LowerCasePipe],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss'
})
export class PatientDashboardComponent {
  private session = inject(PatientSessionService);
  private receptionist = inject(ReceptionistService);

  patient = this.session.currentPatient;

  // Derive the user's appointments
  myAppointments = computed(() => {
    const id = this.session.currentPatientId();
    if (!id) return [];
    return this.receptionist.queue()
      .filter((a: QueueEntry) => a.patientId === id)
      .sort((a: QueueEntry, b: QueueEntry) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  });

  upcomingAppointments = computed(() => {
    const now = new Date();
    // we consider anything today or in the future as upcoming
    now.setHours(0,0,0,0);
    return this.myAppointments().filter((a: QueueEntry) => new Date(a.appointmentDate) >= now && a.status !== 'Cancelled');
  });

  pastAppointments = computed(() => {
    const now = new Date();
    now.setHours(0,0,0,0);
    return this.myAppointments().filter((a: QueueEntry) => new Date(a.appointmentDate) < now || a.status === 'Cancelled');
  });

  nextAppointment = computed(() => {
    const up = this.upcomingAppointments();
    return up.length > 0 ? up[0] : null;
  });
}
