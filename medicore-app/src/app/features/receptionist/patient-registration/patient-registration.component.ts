import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReceptionistService } from '../../../core/services/receptionist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-patient-registration',
  imports: [ReactiveFormsModule],
  templateUrl: './patient-registration.component.html',
  styleUrl: './patient-registration.component.scss'
})
export class PatientRegistrationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private receptionistService = inject(ReceptionistService);
  private toastService = inject(ToastService);

  currentStep = signal(1);
  totalSteps = 3;
  submitted = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  newlyRegisteredPatientId = signal<string | null>(null);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      // Step 1 - Personal Info
      firstName:    ['', Validators.required],
      lastName:     ['', Validators.required],
      dateOfBirth:  ['', Validators.required],
      gender:       ['', Validators.required],
      bloodGroup:   [''],
      // Step 2 - Contact Info
      phone:        ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      email:        ['', [Validators.email]], // optional
      address:      ['', Validators.required],
      // Step 3 - Medical Info
      allergies:    [''],
      medicalHistory: [''],
      emergencyContactName:  ['', Validators.required],
      emergencyContactPhone: ['', Validators.required],
    });
  }

  nextStep() { 
    if (this.isCurrentStepValid()) {
      if (this.currentStep() < this.totalSteps) this.currentStep.update(v => v + 1); 
    } else {
      this.markCurrentStepAsTouched();
    }
  }

  prevStep() { if (this.currentStep() > 1) this.currentStep.update(v => v - 1); }

  private isCurrentStepValid(): boolean {
    const step = this.currentStep();
    let fields: string[] = [];
    if (step === 1) fields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'bloodGroup'];
    if (step === 2) fields = ['phone', 'email', 'address'];
    if (step === 3) fields = ['allergies', 'medicalHistory', 'emergencyContactName', 'emergencyContactPhone'];
    
    return fields.every(f => {
      const control = this.form.get(f);
      return control ? control.valid : true;
    });
  }

  private markCurrentStepAsTouched() {
    const step = this.currentStep();
    let fields: string[] = [];
    if (step === 1) fields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'bloodGroup'];
    if (step === 2) fields = ['phone', 'email', 'address'];
    if (step === 3) fields = ['allergies', 'medicalHistory', 'emergencyContactName', 'emergencyContactPhone'];
    
    fields.forEach(f => this.form.get(f)?.markAsTouched());
  }

  private capitalize(str: string | null | undefined): string {
    if (!str) return '';
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  async submit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      // Capitalize string fields before saving
      const v = { ...this.form.value };
      v.firstName = this.capitalize(v.firstName);
      v.lastName = this.capitalize(v.lastName);
      if (v.emergencyContactName) v.emergencyContactName = this.capitalize(v.emergencyContactName);
      if (v.address) v.address = this.capitalize(v.address);
      if (v.allergies) v.allergies = this.capitalize(v.allergies);
      if (v.medicalHistory) v.medicalHistory = this.capitalize(v.medicalHistory);

      const phone = v.phone;

      try {
        const isDuplicate = await this.receptionistService.checkDuplicatePatient(phone);
        if (isDuplicate) {
          this.toastService.error('Duplicate Found', 'A patient with this phone number already exists.');
          this.isLoading.set(false);
          return;
        }

        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out. Check your Firestore security rules.')), 10000)
        );
        const newId = await Promise.race([
          this.receptionistService.registerPatient(v),
          timeout
        ]);
        this.newlyRegisteredPatientId.set(newId);
        this.submitted.set(true);
        this.toastService.success('Registration Complete', `${v.firstName} ${v.lastName} was registered successfully.`);
      } catch (err: any) {
        console.error('Registration failed:', err);
        const message = err?.code === 'permission-denied'
            ? 'Firebase permission denied. Please update your Firestore security rules to allow writes.'
            : (err?.message || 'Registration failed. Please try again.');
        this.errorMessage.set(message);
        this.toastService.error('Registration Failed', message);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  registerAnother() {
    this.form.reset();
    this.currentStep.set(1);
    this.submitted.set(false);
    this.newlyRegisteredPatientId.set(null);
  }

  goToDashboard() { this.router.navigate(['/receptionist/dashboard']); }
  
  scheduleAppointment() { 
    const id = this.newlyRegisteredPatientId();
    if (id) {
      this.router.navigate(['/receptionist/appointments/new'], { queryParams: { patientId: id } });
    } else {
      this.router.navigate(['/receptionist/appointments']);
    }
  }

  hasError(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c?.touched;
  }
}

