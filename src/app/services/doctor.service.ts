import { Injectable } from '@angular/core';
import { Doctor } from '../models/doctor.model';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly path = 'doctorProfile';

  async getDoctor(id: string): Promise<Doctor | null> {
    const ref = doc(db, this.path, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      return null;
    }
    return { id: snapshot.id, ...(snapshot.data() as Doctor) };
  }

  async saveDoctor(id: string, doctor: Doctor): Promise<void> {
    const ref = doc(db, this.path, id);
    await setDoc(ref, {
      ...doctor,
      updatedAt: serverTimestamp(),
      createdAt: doctor.createdAt ?? serverTimestamp()
    }, { merge: true });
  }
}
