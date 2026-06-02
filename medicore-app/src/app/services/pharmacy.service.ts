import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Drug } from '../models/drug.model';
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
export class PharmacyService {
  private readonly col = 'pharmacy';

  getAll(): Observable<Drug[]> {
    return new Observable<Drug[]>(subscriber => {
      const ref = query(collection(db, this.col), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        ref,
        snapshot => {
          subscriber.next(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Drug) })));
        },
        error => subscriber.error(error)
      );

      return unsubscribe;
    });
  }

  add(drug: Omit<Drug, 'id'>): Promise<void> {
    return addDoc(collection(db, this.col), {
      ...drug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).then(() => {});
  }

  update(id: string, drug: Partial<Drug>): Promise<void> {
    return updateDoc(doc(db, this.col, id), {
      ...drug,
      updatedAt: serverTimestamp()
    });
  }

  delete(id: string): Promise<void> {
    return deleteDoc(doc(db, this.col, id));
  }
}
