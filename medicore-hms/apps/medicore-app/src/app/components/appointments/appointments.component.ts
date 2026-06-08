import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  filtered: Appointment[] = [];
  searchTerm = '';
  filterStatus = 'All';
  showModal = false;
  isEditing = false;
  saving = false;

  form: Omit<Appointment, 'id'> = this.emptyForm();
  private editId: string | null = null;
  private sub = new Subscription();

  statuses = ['All', 'Scheduled', 'Pending', 'Completed', 'Cancelled'];
  appointmentTypes = ['Consultation', 'Follow-up', 'Routine Checkup', 'Emergency', 'Surgery', 'Lab Test', 'Imaging'];

  constructor(private apptService: AppointmentService) {}

  ngOnInit(): void {
    this.sub.add(this.apptService.getAll().subscribe(a => {
      this.appointments = a;
      this.applyFilter();
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  emptyForm(): Omit<Appointment, 'id'> {
    return { patientName: '', doctorName: 'Dr. Adams', date: '', time: '', status: 'Scheduled', type: 'Consultation', notes: '' };
  }

  applyFilter(): void {
    let list = [...this.appointments];
    if (this.filterStatus !== 'All') {
      list = list.filter(a => a.status === this.filterStatus);
    }
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      list = list.filter(a =>
        a.patientName.toLowerCase().includes(term) ||
        a.doctorName.toLowerCase().includes(term) ||
        a.type.toLowerCase().includes(term)
      );
    }
    this.filtered = list;
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.editId = null;
    this.showModal = true;
  }

  openEdit(appt: Appointment): void {
    this.form = { patientName: appt.patientName, doctorName: appt.doctorName, date: appt.date, time: appt.time, status: appt.status, type: appt.type, notes: appt.notes || '' };
    this.isEditing = true;
    this.editId = appt.id!;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  async save(): Promise<void> {
    if (!this.form.patientName.trim() || !this.form.date) return;
    this.saving = true;
    try {
      if (this.isEditing && this.editId) {
        await this.apptService.update(this.editId, this.form);
      } else {
        await this.apptService.add(this.form);
      }
      this.showModal = false;
    } finally {
      this.saving = false;
    }
  }

  async delete(id: string): Promise<void> {
    if (confirm('Delete this appointment?')) {
      await this.apptService.delete(id);
    }
  }

  getBadgeClass(status: string): string {
    return 'badge badge-' + status.toLowerCase();
  }
}
