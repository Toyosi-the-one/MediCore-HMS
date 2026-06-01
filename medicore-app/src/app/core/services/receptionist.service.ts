import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  where,
  runTransaction
} from '@angular/fire/firestore';

/**
 * Core Data Models for MediCore HMS
 */

export interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt?: number;
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type QueueStatus = AppointmentStatus | 'Waiting' | 'With Doctor';

export interface QueueEntry {
  id?: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  doctor: string;
  department: string;
  appointmentDate: string;  // YYYY-MM-DD
  appointmentTime: string;
  status: QueueStatus;
  notes?: string;           // optional reason/notes for the appointment
}

@Injectable({
  providedIn: 'root'
})
/**
 * ReceptionistService
 * This is the central state management service for the receptionist and patient portals.
 * It maintains a real-time connection to Firestore using `onSnapshot` to keep the 
 * Angular Signals (`patients` and `queue`) perfectly in sync with the database.
 */
export class ReceptionistService {
  private firestore = inject(Firestore);

  // Shared state via Signals
  patients  = signal<Patient[]>([]);
  queue     = signal<QueueEntry[]>([]);
  isLoading = signal(true);

  // Track how many collections have returned their first snapshot
  private loadedCount = 0;
  private readonly TOTAL_COLLECTIONS = 2;

  private markLoaded() {
    this.loadedCount++;
    if (this.loadedCount >= this.TOTAL_COLLECTIONS) {
      this.isLoading.set(false);
    }
  }

  // Derived stats — today's appointments only
  private todayISO = new Date().toISOString().split('T')[0];

  queueStats = computed(() => {
    const q = this.queue().filter(e => e.appointmentDate === this.todayISO);
    return {
      total:      q.length,
      waiting:    q.filter(e => e.status === 'Waiting').length,
      withDoctor: q.filter(e => e.status === 'With Doctor').length,
      completed:  q.filter(e => e.status === 'Completed').length,
    };
  });

  constructor() {
    // Safety net: force loading off after 8s no matter what
    setTimeout(() => this.isLoading.set(false), 8000);

    // --- Patients: orderBy firstName (exists on ALL docs, old and new), limit 500 ---
    // We intentionally do NOT use orderBy('createdAt') because old patients lack that field
    // and Firestore silently excludes documents that don't have the orderBy field.
    const patientsQuery = query(collection(this.firestore, 'patients'), orderBy('firstName', 'asc'), limit(500));
    onSnapshot(
      patientsQuery,
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Patient[];
        this.patients.set(data);
        if (this.loadedCount < this.TOTAL_COLLECTIONS) this.markLoaded();
      },
      (error) => {
        console.error('[Firestore] patients error:', error);
        if (this.loadedCount < this.TOTAL_COLLECTIONS) this.markLoaded();
      }
    );

    // --- Appointments: bounded by 500 most recent appointments ---
    const appointmentsQuery = query(collection(this.firestore, 'appointments'), orderBy('appointmentDate', 'desc'), limit(500));
    onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as QueueEntry[];
        this.queue.set(data);
        if (this.loadedCount < this.TOTAL_COLLECTIONS) this.markLoaded();
      },
      (error) => {
        console.error('[Firestore] appointments error:', error);
        if (this.loadedCount < this.TOTAL_COLLECTIONS) this.markLoaded();
      }
    );
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async registerPatient(patientData: Omit<Patient, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, 'patients'), {
      ...patientData,
      createdAt: Date.now()
    });
    return docRef.id;
  }

  async checkDuplicatePatient(phone: string): Promise<boolean> {
    const q = query(collection(this.firestore, 'patients'), where('phone', '==', phone));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async getAppointment(id: string): Promise<QueueEntry | null> {
    const snap = await getDoc(doc(this.firestore, `appointments/${id}`));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as QueueEntry;
  }

  async getPatient(id: string): Promise<Patient | null> {
    const snap = await getDoc(doc(this.firestore, `patients/${id}`));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Patient;
  }

  async updatePatient(id: string, patientData: Partial<Patient>): Promise<void> {
    await updateDoc(doc(this.firestore, `patients/${id}`), patientData);
  }

  /**
   * Schedules a new appointment using a Firestore Transaction.
   * This prevents double-booking by locking the doctor's daily schedule document
   * and verifying the slot is still available before confirming the appointment.
   */
  async scheduleAppointment(entry: Omit<QueueEntry, 'id' | 'status'>): Promise<string> {
    const scheduleId = `${entry.doctor.replace(/[^a-zA-Z0-9]/g, '')}_${entry.appointmentDate}`;
    const scheduleRef = doc(this.firestore, `schedules/${scheduleId}`);
    const apptRef = doc(collection(this.firestore, 'appointments'));

    await runTransaction(this.firestore, async (transaction) => {
      const scheduleDoc = await transaction.get(scheduleRef);
      let bookedSlots: string[] = [];
      if (scheduleDoc.exists()) {
        bookedSlots = scheduleDoc.data()['slots'] || [];
      }

      if (bookedSlots.includes(entry.appointmentTime)) {
        throw new Error('Slot already booked');
      }

      transaction.set(scheduleRef, { slots: [...bookedSlots, entry.appointmentTime] }, { merge: true });
      transaction.set(apptRef, { ...entry, status: 'Pending' });
    });

    return apptRef.id;
  }

  /**
   * Reschedules an existing appointment.
   * If the time or doctor changes, it uses a transaction to safely release the old slot
   * and lock the new slot simultaneously.
   */
  async updateAppointment(
    id: string,
    oldEntry: Pick<QueueEntry, 'doctor' | 'appointmentDate' | 'appointmentTime'>,
    newEntry: Partial<QueueEntry>
  ): Promise<void> {
    const newDoctor = newEntry.doctor ?? oldEntry.doctor;
    const newDate   = newEntry.appointmentDate ?? oldEntry.appointmentDate;
    const newTime   = newEntry.appointmentTime ?? oldEntry.appointmentTime;

    const sameSlot =
      oldEntry.doctor === newDoctor &&
      oldEntry.appointmentDate === newDate &&
      oldEntry.appointmentTime === newTime;

    const apptRef = doc(this.firestore, `appointments/${id}`);

    if (sameSlot) {
      // Nothing changed about the slot — just update the document fields
      await updateDoc(apptRef, newEntry);
      return;
    }

    const oldScheduleId = `${oldEntry.doctor.replace(/[^a-zA-Z0-9]/g, '')}_${oldEntry.appointmentDate}`;
    const newScheduleId = `${newDoctor.replace(/[^a-zA-Z0-9]/g, '')}_${newDate}`;
    const oldScheduleRef = doc(this.firestore, `schedules/${oldScheduleId}`);
    const newScheduleRef = doc(this.firestore, `schedules/${newScheduleId}`);

    await runTransaction(this.firestore, async (transaction) => {
      const newScheduleDoc = await transaction.get(newScheduleRef);
      const bookedSlots: string[] = newScheduleDoc.exists() ? newScheduleDoc.data()['slots'] || [] : [];

      if (bookedSlots.includes(newTime)) {
        throw new Error('Slot already booked');
      }

      // Free the old slot
      const oldScheduleDoc = await transaction.get(oldScheduleRef);
      if (oldScheduleDoc.exists()) {
        const oldSlots: string[] = oldScheduleDoc.data()['slots'] || [];
        transaction.set(oldScheduleRef, { slots: oldSlots.filter(s => s !== oldEntry.appointmentTime) }, { merge: true });
      }

      // Lock the new slot
      transaction.set(newScheduleRef, { slots: [...bookedSlots, newTime] }, { merge: true });

      // Update the appointment document
      transaction.update(apptRef, newEntry);
    });
  }

  async updateQueueStatus(id: string, status: QueueStatus) {
    await updateDoc(doc(this.firestore, `appointments/${id}`), { status });
  }

  async deleteAppointment(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `appointments/${id}`));
  }
}
