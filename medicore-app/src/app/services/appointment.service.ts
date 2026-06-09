import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model';
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
export class AppointmentService {
  private readonly col = 'appointments';

  getAll(): Observable<Appointment[]> {
    return new Observable<Appointment[]>(subscriber => {
      const ref = query(collection(db, this.col), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        ref,
        snapshot => {
          subscriber.next(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Appointment) })));
        },
        error => subscriber.error(error)
      );

      return unsubscribe;
    });
  }

  add(appt: Omit<Appointment, 'id'>): Promise<void> {
    return addDoc(collection(db, this.col), {
      ...appt,
      createdAt: serverTimestamp()
    }).then(() => {});
  }

  update(id: string, appt: Partial<Appointment>): Promise<void> {
    return updateDoc(doc(db, this.col, id), { ...appt });
  }

  delete(id: string): Promise<void> {
    return deleteDoc(doc(db, this.col, id));
  }
}
