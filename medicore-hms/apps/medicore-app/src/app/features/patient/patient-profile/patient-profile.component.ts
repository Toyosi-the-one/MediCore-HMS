import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientSessionService } from '../../../core/services/patient-session.service';
import { ReceptionistService } from '../../../core/services/receptionist.service';

@Component({
  selector: 'app-patient-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './patient-profile.component.html',
  styleUrl: './patient-profile.component.scss'
})
export class PatientProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private session = inject(PatientSessionService);
  private receptionist = inject(ReceptionistService);

  profileForm: FormGroup;
  isSaving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  constructor() {
    this.profileForm = this.fb.group({
      firstName:    ['', Validators.required],
      lastName:     ['', Validators.required],
      dateOfBirth:  ['', Validators.required],
      gender:       ['', Validators.required],
      bloodGroup:   [''],
      phone:        ['', [Validators.required, Validators.pattern(/^[0-9+-\s()]+$/)]],
      email:        ['', [Validators.email]],
      address:      ['', Validators.required],
      emergencyContactName:  ['', Validators.required],
      emergencyContactPhone: ['', Validators.required]
    });
  }

  ngOnInit() {
    const p = this.session.currentPatient();
    if (p) {
      this.profileForm.patchValue({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        phone: p.phone,
        email: p.email,
        address: p.address,
        emergencyContactName: p.emergencyContactName,
        emergencyContactPhone: p.emergencyContactPhone
      });
    }
  }

  private capitalize(str: string | null | undefined): string {
    if (!str) return '';
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  async onSave() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const patientId = this.session.currentPatientId();
    if (!patientId) return;

    this.isSaving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    const v = { ...this.profileForm.value };

    v.firstName = this.capitalize(v.firstName);
    v.lastName = this.capitalize(v.lastName);
    v.emergencyContactName = this.capitalize(v.emergencyContactName);
    v.address = this.capitalize(v.address);
    if (v.bloodGroup) v.bloodGroup = v.bloodGroup.toUpperCase();

    try {
      // If phone changed, check duplicates
      const p = this.session.currentPatient();
      if (p && p.phone !== v.phone) {
        const isDuplicate = await this.receptionist.checkDuplicatePatient(v.phone);
        if (isDuplicate) {
          this.errorMsg.set('This phone number is already taken by another account.');
          this.isSaving.set(false);
          return;
        }
      }

      await this.receptionist.updatePatient(patientId, v);
      this.successMsg.set('Profile updated successfully!');
      
      setTimeout(() => this.successMsg.set(''), 4000);
    } catch (err: any) {
      this.errorMsg.set('Failed to update profile. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  hasError(field: string) {
    const c = this.profileForm.get(field);
    return c?.invalid && c?.touched;
  }
}
