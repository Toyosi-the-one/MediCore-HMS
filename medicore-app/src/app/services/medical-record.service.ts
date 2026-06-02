import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MedicalRecord } from '../models/medical-record.model';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  private readonly col = 'medicalRecords';

  getAll(): Observable<MedicalRecord[]> {
    return new Observable<MedicalRecord[]>(subscriber => {
      const ref = query(collection(db, this.col), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        ref,
        snapshot => {
          subscriber.next(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as MedicalRecord) })));
        },
        error => subscriber.error(error)
      );

      return unsubscribe;
    });
  }

  add(record: Omit<MedicalRecord, 'id'>): Promise<void> {
    return addDoc(collection(db, this.col), {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).then(() => {});
  }

  update(id: string, record: Partial<MedicalRecord>): Promise<void> {
    return updateDoc(doc(db, this.col, id), {
      ...record,
      updatedAt: serverTimestamp()
    });
  }

  delete(id: string): Promise<void> {
    return deleteDoc(doc(db, this.col, id));
  }
}
