import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { ReceptionistService, Patient } from './receptionist.service';

@Injectable({
  providedIn: 'root'
})
/**
 * PatientSessionService
 * Manages the current patient's authentication state within the Patient Portal.
 * It uses localStorage to persist the session across browser reloads, and
 * provides derived signals to easily access the logged-in patient's data throughout the app.
 */
export class PatientSessionService {
  private platformId = inject(PLATFORM_ID);
  private receptionistService = inject(ReceptionistService);
  private firestore = inject(Firestore);

  // Core state: the logged-in patient ID
  currentPatientId = signal<string | null>(null);

  // Derived state: the full patient object
  currentPatient = computed<Patient | null>(() => {
    const id = this.currentPatientId();
    if (!id) return null;
    return this.receptionistService.patients().find(p => p.id === id) || null;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedId = localStorage.getItem('medicore_patient_id');
      if (savedId) {
        this.currentPatientId.set(savedId);
      }
    }
  }

  setPatient(id: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('medicore_patient_id', id);
    }
    this.currentPatientId.set(id);
  }

  clearPatient() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('medicore_patient_id');
    }
    this.currentPatientId.set(null);
  }

  // Looks up a patient by phone number.
  // Fast path: uses the in-memory signal when already loaded.
  // Cold-load fallback: queries Firestore directly when the signal is still empty
  // (avoids incorrectly sending a registered patient to the registration screen
  //  on a fresh page load before the onSnapshot has resolved).
  async findPatientByPhone(phone: string): Promise<Patient | null> {
    const patients = this.receptionistService.patients();
    if (patients.length > 0) {
      return patients.find(p => p.phone === phone) || null;
    }

    // Patients signal is empty — fall back to a direct Firestore query
    const q = query(collection(this.firestore, 'patients'), where('phone', '==', phone));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Patient;
  }
}
