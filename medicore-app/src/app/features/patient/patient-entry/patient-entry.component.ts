import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientSessionService } from '../../../core/services/patient-session.service';
import { ReceptionistService } from '../../../core/services/receptionist.service';

@Component({
  selector: 'app-patient-entry',
  imports: [ReactiveFormsModule],
  templateUrl: './patient-entry.component.html',
  styleUrl: './patient-entry.component.scss'
})
export class PatientEntryComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private session = inject(PatientSessionService);
  private receptionistService = inject(ReceptionistService);

  mode = signal<'lookup' | 'register'>('lookup');
  isLoading = signal(false);
  errorMsg = signal('');

  lookupForm: FormGroup;
  regForm: FormGroup;

  constructor() {
    this.lookupForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+-\s()]+$/)]]
    });

    this.regForm = this.fb.group({
      firstName:    ['', Validators.required],
      lastName:     ['', Validators.required],
      dateOfBirth:  ['', Validators.required],
      gender:       ['', Validators.required],
      bloodGroup:   [''],
      phone:        ['', [Validators.required, Validators.pattern(/^[0-9+-\s()]+$/)]],
      email:        ['', [Validators.email]],
      address:      ['', Validators.required],
      emergencyContactName:  ['', Validators.required],
      emergencyContactPhone: ['', Validators.required],
      allergies:    [''],
      medicalHistory: [''],
    });
  }

  async onLookup() {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');
    const phone = this.lookupForm.value.phone.trim();

    try {
      const patient = await this.session.findPatientByPhone(phone);
      if (patient && patient.id) {
        // Patient found, log them in
        this.session.setPatient(patient.id);
        this.router.navigate(['/patient/dashboard']);
      } else {
        // Not found, switch to registration and pre-fill phone
        this.regForm.patchValue({ phone });
        this.mode.set('register');
      }
    } catch (err: any) {
      this.errorMsg.set('An error occurred. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private capitalize(str: string | null | undefined): string {
    if (!str) return '';
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  async onRegister() {
    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');
    const v = { ...this.regForm.value };

    v.firstName = this.capitalize(v.firstName);
    v.lastName = this.capitalize(v.lastName);
    v.emergencyContactName = this.capitalize(v.emergencyContactName);
    v.address = this.capitalize(v.address);
    if (v.bloodGroup) v.bloodGroup = v.bloodGroup.toUpperCase();

    try {
      // It's possible they typed a phone that IS registered but the query was slow or they got here another way. Check again.
      const isDuplicate = await this.receptionistService.checkDuplicatePatient(v.phone);
      if (isDuplicate) {
        this.errorMsg.set('This phone number is already registered. Please go back and login.');
        this.isLoading.set(false);
        return;
      }

      const newId = await this.receptionistService.registerPatient(v);
      this.session.setPatient(newId);
      this.router.navigate(['/patient/dashboard']);
    } catch (err: any) {
      this.errorMsg.set('Registration failed. Please try again.');
      this.isLoading.set(false);
    }
  }

  backToLookup() {
    this.mode.set('lookup');
    this.errorMsg.set('');
  }

  hasError(form: FormGroup, field: string) {
    const c = form.get(field);
    return c?.invalid && c?.touched;
  }
}
