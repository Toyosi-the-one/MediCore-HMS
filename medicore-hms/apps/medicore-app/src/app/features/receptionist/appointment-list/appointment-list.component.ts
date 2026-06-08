import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QueueEntry, QueueStatus, ReceptionistService } from '../../../core/services/receptionist.service';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-appointment-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss'
})
export class AppointmentListComponent {
  private receptionistService = inject(ReceptionistService);
  private toastService = inject(ToastService);

  isLoading = this.receptionistService.isLoading;
  allAppointments = this.receptionistService.queue;
  searchQuery = signal('');
  activeFilter = signal<string>('All');
  filters = ['All', 'Pending', 'Waiting', 'With Doctor', 'Completed', 'Cancelled'];

  currentPage = signal(1);
  pageSize = signal(15);

  // Only today and future appointments — past days are not shown
  private todayISO = new Date().toISOString().split('T')[0];

  filteredAppointments = computed(() => {
    let list = this.allAppointments().filter(a => a.appointmentDate >= this.todayISO);
    
    const f = this.activeFilter();
    if (f !== 'All') {
      list = list.filter(a => a.status === f);
    }

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(a =>
        a.patientName.toLowerCase().includes(q) ||
        a.doctor.toLowerCase().includes(q) ||
        a.appointmentDate.includes(q)
      );
    }

    // Sort by date (newest first for general view, or upcoming first)
    // Let's sort by date descending
    return list.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`).getTime();
      const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`).getTime();
      return dateA - dateB; // soonest first
    });
  });

  paginatedAppointments = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredAppointments().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredAppointments().length / this.pageSize()) || 1);

  setFilter(f: string) {
    this.activeFilter.set(f);
    this.currentPage.set(1);
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  async updateStatus(id: string, status: QueueStatus) {
    try {
      await this.receptionistService.updateQueueStatus(id, status);
      this.toastService.success('Status Updated', `Appointment marked as ${status}`);
    } catch (err) {
      this.toastService.error('Update Failed', 'Could not update status. Please try again.');
    }
  }

  async deleteAppointment(id: string) {
    if (confirm('Are you sure you want to permanently delete this cancelled appointment?')) {
      try {
        await this.receptionistService.deleteAppointment(id);
        this.toastService.success('Deleted', 'Appointment record has been permanently removed.');
      } catch (err) {
        this.toastService.error('Delete Failed', 'Could not delete the record. Please try again.');
      }
    }
  }
}
