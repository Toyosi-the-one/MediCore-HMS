import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReceptionistService } from '../../../core/services/receptionist.service';
import { ToastService } from '../../../core/services/toast.service';
import { DEPARTMENTS, DOCTORS_BY_DEPT, ALL_TIME_SLOTS } from '../../../core/data/appointment.config';

@Component({
  selector: 'app-schedule-appointment',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './schedule-appointment.component.html',
  styleUrl: './schedule-appointment.component.scss'
})
export class ScheduleAppointmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private receptionistService = inject(ReceptionistService);
  private toastService = inject(ToastService);

  submitted = signal(false);
  isLoading = this.receptionistService.isLoading;
  editId = signal<string | null>(null);
  private oldAppointment = signal<{ doctor: string; appointmentDate: string; appointmentTime: string } | null>(null);

  departments = DEPARTMENTS;
  doctorsByDept = DOCTORS_BY_DEPT;
  timeSlots = ALL_TIME_SLOTS;

  // Reactive signals that track form values for use in computed()
  private selectedDoctor = signal('');
  private selectedDate   = signal('');

  form: FormGroup;
  availableDoctors = signal<string[]>([]);
  patients = this.receptionistService.patients;

  // Computed signal that automatically recalculates available time slots.
  // It filters the real-time queue to find appointments matching the selected doctor and date,
  // excluding cancelled ones. If in edit mode, it also excludes the current appointment's slot
  // so the user can keep their existing time if they are only changing other details.
  takenSlots = computed(() => {
    const doctor = this.selectedDoctor();
    const date   = this.selectedDate();
    if (!doctor || !date) return [];

    return this.receptionistService.queue()
      .filter(e =>
        e.id !== this.editId() && // ignore current appointment if editing
        e.doctor === doctor &&
        e.appointmentDate === date &&
        e.status !== 'Cancelled'
      )
      .map(e => e.appointmentTime);
  });

  constructor() {
    this.form = this.fb.group({
      patientId:    ['', Validators.required],
      patientName:  [''],
      department:   ['', Validators.required],
      doctor:       ['', Validators.required],
      date:         ['', Validators.required],
      timeSlot:     ['', Validators.required],
      notes:        [''],
    });

    // When department changes, reset doctor and update available doctors
    this.form.get('department')?.valueChanges.subscribe(dept => {
      this.availableDoctors.set(this.doctorsByDept[dept] ?? []);
      this.form.get('doctor')?.setValue('');
      this.form.get('timeSlot')?.setValue('');
    });

    // Sync doctor signal so takenSlots recomputes
    this.form.get('doctor')?.valueChanges.subscribe(doc => {
      this.selectedDoctor.set(doc ?? '');
      this.form.get('timeSlot')?.setValue(''); // reset slot when doctor changes
    });

    // Sync date signal so takenSlots recomputes
    this.form.get('date')?.valueChanges.subscribe(date => {
      this.selectedDate.set(date ?? '');
      this.form.get('timeSlot')?.setValue(''); // reset slot when date changes
    });

    // Auto-update patientName when patientId changes
    this.form.get('patientId')?.valueChanges.subscribe(id => {
      if (id) {
        const patient = this.patients().find(p => p.id === id);
        if (patient) {
          this.form.get('patientName')?.setValue(`${patient.firstName} ${patient.lastName}`);
        }
      } else {
        this.form.get('patientName')?.setValue('');
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // Auto-select patient if passed
      if (params['patientId']) {
        this.form.get('patientId')?.setValue(params['patientId']);
      }
      
      // Load edit mode if appointmentId is passed
      if (params['editId']) {
        this.editId.set(params['editId']);
        this.loadAppointment(params['editId']);
      }
    });
  }

  private async loadAppointment(id: string) {
    // Bug 3 fix: fetch directly from Firestore — never rely on the local
    // queue() signal which may be empty if the snapshot hasn't arrived yet.
    const appt = await this.receptionistService.getAppointment(id);
    if (appt) {
      this.oldAppointment.set({
        doctor: appt.doctor,
        appointmentDate: appt.appointmentDate,
        appointmentTime: appt.appointmentTime,
      });
      this.form.patchValue({
        patientId: appt.patientId,
        patientName: appt.patientName,
        department: appt.department,
        doctor: appt.doctor,
        date: appt.appointmentDate,
        timeSlot: appt.appointmentTime
      });
    } else {
      this.toastService.error('Not Found', 'Could not load appointment details.');
    }
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
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
  isSlotSelected(slot: string) { return this.form.get('timeSlot')?.value === slot; }

  selectSlot(slot: string) {
    if (!this.isSlotDisabled(slot)) {
      this.form.get('timeSlot')?.setValue(slot);
    }
  }

  async submit() {
    if (this.form.valid) {
      const val = this.form.value;
      const patient = this.patients().find(p => p.id === val.patientId);

      try {
        const payload = {
          patientId:       val.patientId,
          patientName:     patient ? `${patient.firstName} ${patient.lastName}` : val.patientName,
          age:             patient ? this.calculateAge(patient.dateOfBirth) : 0,
          gender:          patient ? patient.gender : 'Other',
          doctor:          val.doctor,
          department:      val.department,
          appointmentDate: val.date,
          appointmentTime: val.timeSlot,
          notes:           val.notes || '',
        };

        if (this.editId()) {
          const old = this.oldAppointment();
          if (!old) {
            this.toastService.error('Booking Failed', 'Original appointment data missing. Please try again.');
            return;
          }
          await this.receptionistService.updateAppointment(this.editId()!, old, payload);
          this.toastService.success('Appointment Rescheduled', `Rescheduled for ${val.timeSlot} on ${val.date}`);
        } else {
          await this.receptionistService.scheduleAppointment(payload);
          this.toastService.success('Appointment Scheduled', `Booked for ${val.timeSlot} on ${val.date}`);
        }

        this.submitted.set(true);
      } catch (err: any) {
        const msg = err.message === 'Slot already booked'
          ? 'This time slot was just booked by someone else. Please choose another time.'
          : 'An error occurred. Please try again.';
        this.toastService.error('Booking Failed', msg);
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  private calculateAge(dobStr: string): number {
    const dob  = new Date(dobStr);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  hasError(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c?.touched;
  }

  scheduleAnother() {
    this.form.reset();
    this.submitted.set(false);
    this.availableDoctors.set([]);
    this.selectedDoctor.set('');
    this.selectedDate.set('');
  }

  goToDashboard() { this.router.navigate(['/receptionist/dashboard']); }
}
