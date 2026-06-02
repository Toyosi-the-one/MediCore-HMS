import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { Patient, ReceptionistService } from '../../../core/services/receptionist.service';

@Component({
  selector: 'app-patient-list',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent {
  private receptionistService = inject(ReceptionistService);

  isLoading       = this.receptionistService.isLoading;
  searchQuery     = signal('');
  bloodGroupFilter = signal('');
  genderFilter    = signal('');
  viewMode        = signal<'list' | 'grid'>('list');
  currentPage     = signal(1);
  pageSize        = signal(10);
  openDropdownId  = signal<string | null>(null);

  readonly bloodGroups     = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  readonly genders         = ['Male', 'Female', 'Other'];
  readonly pageSizeOptions = [10, 25, 50];

  // Valid patients (guards against corrupt test records)
  allPatients = computed(() =>
    this.receptionistService.patients().filter(p => p.firstName?.trim())
  );

  filteredPatients = computed(() => {
    let list = this.allPatients();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.phone ?? '').includes(q) ||
        (p.email ?? '').toLowerCase().includes(q)
      );
    }

    if (this.bloodGroupFilter()) {
      list = list.filter(p => p.bloodGroup === this.bloodGroupFilter());
    }

    if (this.genderFilter()) {
      list = list.filter(p => p.gender === this.genderFilter());
    }

    return list;
  });

  paginatedPatients = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredPatients().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredPatients().length / this.pageSize()) || 1
  );

  activeFilterCount = computed(() =>
    [this.searchQuery(), this.bloodGroupFilter(), this.genderFilter()].filter(Boolean).length
  );

  showingStart = computed(() =>
    this.filteredPatients().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  showingEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredPatients().length)
  );

  getPages(): (number | '...')[] {
    const total = this.totalPages();
    const cur   = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (cur <= 4)   return [1, 2, 3, 4, 5, '...', total];
    if (cur >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', cur - 1, cur, cur + 1, '...', total];
  }

  // Generate a stable formatted patient ID based on position in the master list
  getPatientId(patient: Patient): string {
    const idx = this.allPatients().findIndex(p => p.id === patient.id);
    return 'P-' + String(idx + 1).padStart(5, '0');
  }

  // Generate a consistent color per patient from their name
  getAvatarStyle(name: string): string {
    const palette = [
      '#4F46E5','#7C3AED','#DB2777','#DC2626','#D97706',
      '#059669','#0284C7','#9333EA','#C2410C','#0F766E'
    ];
    const idx = (name?.charCodeAt(0) ?? 0) % palette.length;
    return palette[idx];
  }

  calculateAge(dob: string): number {
    if (!dob) return 0;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }

  // ── Events ──────────────────────────────────────────────────────────────

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onBloodGroupChange(event: Event) {
    this.bloodGroupFilter.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  onGenderChange(event: Event) {
    this.genderFilter.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  clearAllFilters() {
    this.searchQuery.set('');
    this.bloodGroupFilter.set('');
    this.genderFilter.set('');
    this.currentPage.set(1);
  }

  onPageSizeChange(event: Event) {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  goToPage(p: number) { this.currentPage.set(p); }

  toggleDropdown(id: string, event: Event) {
    event.stopPropagation();
    this.openDropdownId.set(this.openDropdownId() === id ? null : id);
  }

  @HostListener('document:click')
  closeDropdowns() { this.openDropdownId.set(null); }
}
