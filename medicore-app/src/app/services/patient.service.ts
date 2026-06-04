import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly col = 'patients';

  getAll(): Observable<Patient[]> {
    return new Observable<Patient[]>(subscriber => {
      const ref = query(collection(db, this.col), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        ref,
        snapshot => {
          subscriber.next(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Patient) })));
        },
        error => subscriber.error(error)
      );

      return unsubscribe;
    });
  }

  add(patient: Omit<Patient, 'id'>): Promise<void> {
    return addDoc(collection(db, this.col), {
      ...patient,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).then(() => {});
  }

  update(id: string, patient: Partial<Patient>): Promise<void> {
    return updateDoc(doc(db, this.col, id), {
      ...patient,
      updatedAt: serverTimestamp()
    });
  }

  delete(id: string): Promise<void> {
    return deleteDoc(doc(db, this.col, id));
  }

  async getById(id: string): Promise<Patient | null> {
    const d = await getDoc(doc(db, this.col, id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as Patient) };
  }
}
