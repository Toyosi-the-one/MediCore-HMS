import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Patient } from '../../models/patient.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit, OnDestroy {
  patients: Patient[] = [];
  filtered: Patient[] = [];
  searchTerm = '';
  showModal = false;
  isEditing = false;
  saving = false;

  form: Omit<Patient, 'id'> = this.emptyForm();

  private editId: string | null = null;
  private sub = new Subscription();

  constructor(private patientService: PatientService, private toast: ToastService) {}

  ngOnInit(): void {
    this.sub.add(this.patientService.getAll().subscribe(p => {
      this.patients = p;
      this.applyFilter();
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  emptyForm(): Omit<Patient, 'id'> {
    return { name: '', age: 0, gender: 'Male', phone: '', address: '', diagnosis: '', prescription: '' };
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = term
      ? this.patients.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.phone.includes(term) ||
          p.diagnosis.toLowerCase().includes(term)
        )
      : [...this.patients];
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.editId = null;
    this.showModal = true;
  }

  openEdit(patient: Patient): void {
    this.form = { name: patient.name, age: patient.age, gender: patient.gender, phone: patient.phone, address: patient.address, diagnosis: patient.diagnosis, prescription: patient.prescription };
    this.isEditing = true;
    this.editId = patient.id!;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  async save(): Promise<void> {
    if (!this.form.name.trim()) return;
    this.saving = true;
    try {
      if (this.isEditing && this.editId) {
        await this.patientService.update(this.editId, this.form);
        this.toast.show('Patient updated', 'success');
      } else {
        await this.patientService.add(this.form);
        this.toast.show('Patient added', 'success');
      }
      this.showModal = false;
    } finally {
      this.saving = false;
    }
  }

  async delete(id: string): Promise<void> {
    if (confirm('Delete this patient? This action cannot be undone.')) {
      await this.patientService.delete(id);
      this.toast.show('Patient deleted', 'success');
    }
  }
}
