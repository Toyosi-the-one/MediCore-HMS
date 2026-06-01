import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QueueEntry, QueueStatus, ReceptionistService } from '../../../core/services/receptionist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-queue-dashboard',
  imports: [RouterLink],
  templateUrl: './queue-dashboard.component.html',
  styleUrl: './queue-dashboard.component.scss'
})
export class QueueDashboardComponent {
  private receptionistService = inject(ReceptionistService);
  private toastService = inject(ToastService);

  // Today's date in two formats: display label + YYYY-MM-DD for filtering
  today        = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  todayISO     = new Date().toISOString().split('T')[0]; // e.g. "2026-05-25"

  isLoading = this.receptionistService.isLoading;

  // Only today's appointments from the full queue
  todayQueue = computed(() =>
    this.receptionistService.queue().filter(e => e.appointmentDate === this.todayISO)
  );

  // Stats computed from today's queue only
  stats = computed(() => {
    const q = this.todayQueue();
    return {
      total:      q.length,
      waiting:    q.filter(e => e.status === 'Waiting').length,
      withDoctor: q.filter(e => e.status === 'With Doctor').length,
      completed:  q.filter(e => e.status === 'Completed').length,
    };
  });

  activeFilter = signal<string>('All');
  filters = ['All', 'Waiting', 'With Doctor', 'Completed', 'Cancelled', 'Pending'];

  filteredQueue = computed(() => {
    const f = this.activeFilter();
    return f === 'All'
      ? this.todayQueue()
      : this.todayQueue().filter(q => q.status === f);
  });

  currentPage = signal(1);
  pageSize = signal(10);

  paginatedQueue = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredQueue().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredQueue().length / this.pageSize()) || 1);

  setFilter(f: string) {
    this.activeFilter.set(f);
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

  callNext() {
    const next = this.todayQueue().find(e => e.status === 'Waiting');
    if (next && next.id) {
      this.updateStatus(next.id, 'With Doctor');
    } else {
      this.toastService.info('Queue Empty', 'There are no waiting patients.');
    }
  }

  trackById(_: number, item: QueueEntry) { return item.id; }
}
