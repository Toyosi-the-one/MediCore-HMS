import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientSessionService } from '../../../core/services/patient-session.service';
import { ReceptionistService } from '../../../core/services/receptionist.service';
import { DEPARTMENTS, DOCTORS_BY_DEPT, PATIENT_TIME_SLOTS } from '../../../core/data/appointment.config';

@Component({
  selector: 'app-patient-book',
  imports: [ReactiveFormsModule],
  templateUrl: './patient-book.component.html',
  styleUrl: './patient-book.component.scss'
})
export class PatientBookComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private session = inject(PatientSessionService);
  private receptionist = inject(ReceptionistService);

  apptForm: FormGroup;
  isLoading = signal(false);
  errorMsg = signal('');

  departments = DEPARTMENTS;
  doctorsByDept = DOCTORS_BY_DEPT;
  timeSlots = PATIENT_TIME_SLOTS;

  availableDoctors = signal<string[]>([]);
  private selectedDoctor = signal('');
  private selectedDate   = signal('');

  minDate = new Date().toISOString().split('T')[0];

  takenSlots = computed(() => {
    const doctor = this.selectedDoctor();
    const date   = this.selectedDate();
    if (!doctor || !date) return [];

    return this.receptionist.queue()
      .filter(e =>
        e.doctor === doctor &&
        e.appointmentDate === date &&
        e.status !== 'Cancelled'
      )
      .map(e => e.appointmentTime);
  });

  constructor() {
    this.apptForm = this.fb.group({
      department: ['', Validators.required],
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason: ['', Validators.required]
    });

    this.apptForm.get('department')?.valueChanges.subscribe(dept => {
      this.availableDoctors.set(this.doctorsByDept[dept] ?? []);
      this.apptForm.get('doctor')?.setValue('');
      this.apptForm.get('time')?.setValue('');
    });

    this.apptForm.get('doctor')?.valueChanges.subscribe(doc => {
      this.selectedDoctor.set(doc ?? '');
      this.apptForm.get('time')?.setValue('');
    });

    this.apptForm.get('date')?.valueChanges.subscribe(date => {
      this.selectedDate.set(date ?? '');
      this.apptForm.get('time')?.setValue('');
    });
  }

  isSlotPast(slot: string): boolean {
    if (this.selectedDate() !== this.minDate) return false;
    
    const match = slot.match(/(\d+):(\d+)\s+(AM|PM)/i);
    if (!match) return false;
    let [_, h, m, ampm] = match;
    let hour = parseInt(h, 10);
    const min = parseInt(m, 10);
    if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
    if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
    
    const now = new Date();
    return hour < now.getHours() || (hour === now.getHours() && min <= now.getMinutes());
  }

  isSlotTaken(slot: string)    { return this.takenSlots().includes(slot); }
  isSlotDisabled(slot: string) { return this.isSlotTaken(slot) || this.isSlotPast(slot); }

  selectSlot(slot: string) {
    if (!this.isSlotDisabled(slot)) {
      this.apptForm.get('time')?.setValue(slot);
    }
  }

  private calculateAge(dobStr: string): number {
    const dob  = new Date(dobStr);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  async onSubmit() {
    if (this.apptForm.invalid) {
      this.apptForm.markAllAsTouched();
      return;
    }

    const val = this.apptForm.value;
    const patientId = this.session.currentPatientId();
    if (!patientId) return;

    const patient = this.session.currentPatient();
    if (!patient) return;

    this.isLoading.set(true);
    this.errorMsg.set('');

    try {
      await this.receptionist.scheduleAppointment({
        patientId: patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        age: this.calculateAge(patient.dateOfBirth),
        gender: patient.gender,
        department: val.department,
        doctor: val.doctor,
        appointmentDate: val.date,
        appointmentTime: val.time,
        notes: val.reason || '',
      });

      this.router.navigate(['/patient/appointments']);
    } catch (err: any) {
      this.errorMsg.set(err.message === 'Slot already booked' 
        ? 'This time slot was just booked by someone else. Please choose another time.' 
        : 'Failed to book appointment. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  hasError(field: string) {
    const c = this.apptForm.get(field);
    return c?.invalid && c?.touched;
  }
}
