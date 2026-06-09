import { Component, inject, computed, signal } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientSessionService } from '../../../core/services/patient-session.service';
import { ReceptionistService, QueueEntry } from '../../../core/services/receptionist.service';

@Component({
  selector: 'app-patient-appointments',
  imports: [DatePipe, LowerCasePipe, RouterLink],
  templateUrl: './patient-appointments.component.html',
  styleUrl: './patient-appointments.component.scss'
})
export class PatientAppointmentsComponent {
  private session = inject(PatientSessionService);
  private receptionist = inject(ReceptionistService);

  statusFilter = signal<string>('All');

  allMyAppointments = computed(() => {
    const id = this.session.currentPatientId();
    if (!id) return [];
    return this.receptionist.queue()
      .filter((a: QueueEntry) => a.patientId === id)
      .sort((a: QueueEntry, b: QueueEntry) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
  });

  filteredAppointments = computed(() => {
    const status = this.statusFilter();
    if (status === 'All') return this.allMyAppointments();
    return this.allMyAppointments().filter((a: QueueEntry) => a.status === status);
  });

  setStatusFilter(status: string) {
    this.statusFilter.set(status);
  }
}
