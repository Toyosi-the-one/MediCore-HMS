import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReceptionistService } from '../../../core/services/receptionist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-edit-patient',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-patient.component.html',
  styleUrl: './edit-patient.component.scss'
})
export class EditPatientComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private receptionistService = inject(ReceptionistService);
  private toastService = inject(ToastService);

  form: FormGroup;
  patientId = signal<string | null>(null);
  isLoading = signal(false);

  constructor() {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      bloodGroup: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+-\s()]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      allergies: [''],
      medicalHistory: [''],
      emergencyContactName: ['', Validators.required],
      emergencyContactPhone: ['', [Validators.required, Validators.pattern(/^[0-9+-\s()]+$/)]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientId.set(id);
      this.loadPatient(id);
    }
  }

  async loadPatient(id: string) {
    // Fetch directly from Firestore — never rely on the local patients signal
    // which may be empty if the snapshot hasn't arrived yet (race condition).
    const patient = await this.receptionistService.getPatient(id);
    if (patient) {
      this.form.patchValue(patient);
    } else {
      this.toastService.error('Not Found', 'Could not find patient record.');
      this.router.navigate(['/receptionist/patients']);
    }
  }

  hasError(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c?.touched;
  }

  private capitalize(str: string | null | undefined): string {
    if (!str) return '';
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  async submit() {
    if (this.form.valid && this.patientId()) {
      this.isLoading.set(true);
      
      const v = { ...this.form.value };
      v.firstName = this.capitalize(v.firstName);
      v.lastName = this.capitalize(v.lastName);
      if (v.emergencyContactName) v.emergencyContactName = this.capitalize(v.emergencyContactName);
      if (v.address) v.address = this.capitalize(v.address);
      if (v.allergies) v.allergies = this.capitalize(v.allergies);
      if (v.medicalHistory) v.medicalHistory = this.capitalize(v.medicalHistory);
      if (v.bloodGroup) v.bloodGroup = v.bloodGroup.toUpperCase();

      try {
        await this.receptionistService.updatePatient(this.patientId()!, v);
        this.toastService.success('Patient Updated', `${v.firstName} ${v.lastName}'s profile has been updated.`);
        this.router.navigate(['/receptionist/patients']);
      } catch (err) {
        this.toastService.error('Update Failed', (err as any).message || 'Could not update patient.');
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/receptionist/patients']);
  }
}
