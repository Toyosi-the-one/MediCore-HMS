import { Injectable, signal, computed, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { getFirestore, collection, query, where, getDocs, Firestore } from 'firebase/firestore';

import { ReceptionistService, Patient } from './receptionist.service';
import { FIRESTORE } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class PatientSessionService {
  private platformId = inject(PLATFORM_ID);
  private receptionistService = inject(ReceptionistService);

  // ----------------------------
  // STATE
  // ----------------------------
  currentPatientId = signal<string | null>(null);

  // ----------------------------
  // DERIVED STATE
  // ----------------------------
  currentPatient = computed<Patient | null>(() => {
    const id = this.currentPatientId();
    if (!id) return null;

    return this.receptionistService.patients().find((p) => p.id === id) || null;
  });

  // ----------------------------
  // INIT
  // ----------------------------
  constructor(@Inject(FIRESTORE) private db: Firestore) {
    if (isPlatformBrowser(this.platformId)) {
      const savedId = localStorage.getItem('medicore_patient_id');
      if (savedId) {
        this.currentPatientId.set(savedId);
      }
    }
  }

  // ----------------------------
  // SET PATIENT
  // ----------------------------
  setPatient(id: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('medicore_patient_id', id);
    }
    this.currentPatientId.set(id);
  }

  // ----------------------------
  // CLEAR PATIENT
  // ----------------------------
  clearPatient() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('medicore_patient_id');
    }
    this.currentPatientId.set(null);
  }

  // ----------------------------
  // FIRESTORE LOOKUP (Firebase SDK)
  // ----------------------------
  async findPatientByPhone(phone: string): Promise<Patient | null> {
    const cached = this.receptionistService.patients();

    // fast path (in-memory)
    if (cached.length > 0) {
      return cached.find((p) => p.phone === phone) || null;
    }

    // Firestore query (SDK)
    const patientsRef = collection(this.db, 'patients');
    const q = query(patientsRef, where('phone', '==', phone));

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const doc = snap.docs[0];

    return {
      id: doc.id,
      ...(doc.data() as Patient),
    };
  }
}
