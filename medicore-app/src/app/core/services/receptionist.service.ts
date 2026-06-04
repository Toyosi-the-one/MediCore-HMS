import { Injectable, signal, computed, Inject } from '@angular/core';

import {
  getFirestore,
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
  runTransaction,
  Firestore,
} from 'firebase/firestore';
import { FIRESTORE } from '../../app.config';

/**
 * Core Data Models
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
  appointmentDate: string;
  appointmentTime: string;
  status: QueueStatus;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReceptionistService {
  private firestore: Firestore;

  // State
  patients = signal<Patient[]>([]);
  queue = signal<QueueEntry[]>([]);
  isLoading = signal(true);

  private loadedCount = 0;
  private readonly TOTAL_COLLECTIONS = 2;

  private todayISO = new Date().toISOString().split('T')[0];

  queueStats = computed(() => {
    const q = this.queue().filter((e) => e.appointmentDate === this.todayISO);
    return {
      total: q.length,
      waiting: q.filter((e) => e.status === 'Waiting').length,
      withDoctor: q.filter((e) => e.status === 'With Doctor').length,
      completed: q.filter((e) => e.status === 'Completed').length,
    };
  });

  constructor(@Inject(FIRESTORE) firestore: Firestore) {
    this.firestore = firestore;
    setTimeout(() => this.isLoading.set(false), 8000);

    // ── PATIENTS REALTIME ──
    const patientsQuery = query(
      collection(this.firestore, 'patients'),
      orderBy('firstName', 'asc'),
      limit(500),
    );

    onSnapshot(
      patientsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Patient[];

        this.patients.set(data);
        this.markLoaded();
      },
      (error) => {
        console.error('patients error:', error);
        this.markLoaded();
      },
    );

    // ── APPOINTMENTS REALTIME ──
    const appointmentsQuery = query(
      collection(this.firestore, 'appointments'),
      orderBy('appointmentDate', 'desc'),
      limit(500),
    );

    onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as QueueEntry[];

        this.queue.set(data);
        this.markLoaded();
      },
      (error) => {
        console.error('appointments error:', error);
        this.markLoaded();
      },
    );
  }

  private markLoaded() {
    this.loadedCount++;
    if (this.loadedCount >= this.TOTAL_COLLECTIONS) {
      this.isLoading.set(false);
    }
  }

  // ─────────────────────────────────────────────
  // CRUD OPERATIONS
  // ─────────────────────────────────────────────

  async registerPatient(patientData: Omit<Patient, 'id'>) {
    const ref = await addDoc(collection(this.firestore, 'patients'), {
      ...patientData,
      createdAt: Date.now(),
    });

    return ref.id;
  }

  async checkDuplicatePatient(phone: string) {
    const q = query(collection(this.firestore, 'patients'), where('phone', '==', phone));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async getAppointment(id: string) {
    const snap = await getDoc(doc(this.firestore, 'appointments', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as QueueEntry;
  }

  async getPatient(id: string) {
    const snap = await getDoc(doc(this.firestore, 'patients', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Patient;
  }

  async updatePatient(id: string, data: Partial<Patient>) {
    await updateDoc(doc(this.firestore, 'patients', id), data);
  }

  async updateQueueStatus(id: string, status: QueueStatus) {
    await updateDoc(doc(this.firestore, 'appointments', id), { status });
  }

  async deleteAppointment(id: string) {
    await deleteDoc(doc(this.firestore, 'appointments', id));
  }

  // ─────────────────────────────────────────────
  // TRANSACTIONS
  // ─────────────────────────────────────────────

  async scheduleAppointment(entry: Omit<QueueEntry, 'id' | 'status'>) {
    const scheduleId = `${entry.doctor.replace(/[^a-zA-Z0-9]/g, '')}_${entry.appointmentDate}`;

    const scheduleRef = doc(this.firestore, 'schedules', scheduleId);
    const apptRef = doc(collection(this.firestore, 'appointments'));

    await runTransaction(this.firestore, async (tx) => {
      const scheduleSnap = await tx.get(scheduleRef);
      const bookedSlots: string[] = scheduleSnap.exists() ? scheduleSnap.data()['slots'] || [] : [];

      if (bookedSlots.includes(entry.appointmentTime)) {
        throw new Error('Slot already booked');
      }

      tx.set(
        scheduleRef,
        {
          slots: [...bookedSlots, entry.appointmentTime],
        },
        { merge: true },
      );

      tx.set(apptRef, {
        ...entry,
        status: 'Pending',
      });
    });

    return apptRef.id;
  }

  async updateAppointment(id: string, oldEntry: any, newEntry: any) {
    const newDoctor = newEntry.doctor ?? oldEntry.doctor;
    const newDate = newEntry.appointmentDate ?? oldEntry.appointmentDate;
    const newTime = newEntry.appointmentTime ?? oldEntry.appointmentTime;

    const sameSlot =
      oldEntry.doctor === newDoctor &&
      oldEntry.appointmentDate === newDate &&
      oldEntry.appointmentTime === newTime;

    const apptRef = doc(this.firestore, 'appointments', id);

    if (sameSlot) {
      await updateDoc(apptRef, newEntry);
      return;
    }

    const oldScheduleId = `${oldEntry.doctor.replace(/[^a-zA-Z0-9]/g, '')}_${oldEntry.appointmentDate}`;
    const newScheduleId = `${newDoctor.replace(/[^a-zA-Z0-9]/g, '')}_${newDate}`;

    const oldScheduleRef = doc(this.firestore, 'schedules', oldScheduleId);
    const newScheduleRef = doc(this.firestore, 'schedules', newScheduleId);

    await runTransaction(this.firestore, async (tx) => {
      const newSnap = await tx.get(newScheduleRef);
      const booked: string[] = newSnap.exists() ? newSnap.data()['slots'] || [] : [];

      if (booked.includes(newTime)) {
        throw new Error('Slot already booked');
      }

      const oldSnap = await tx.get(oldScheduleRef);
      if (oldSnap.exists()) {
        const oldSlots: string[] = oldSnap.data()['slots'] || [];
        tx.set(
          oldScheduleRef,
          {
            slots: oldSlots.filter((s) => s !== oldEntry.appointmentTime),
          },
          { merge: true },
        );
      }

      tx.set(
        newScheduleRef,
        {
          slots: [...booked, newTime],
        },
        { merge: true },
      );

      tx.update(apptRef, newEntry);
    });
  }
}
