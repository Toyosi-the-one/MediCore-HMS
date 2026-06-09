import { Injectable, Inject } from '@angular/core';
import { getFirestore, collection, onSnapshot, Firestore } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { FIRESTORE } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private patientsSubject = new BehaviorSubject<any[]>([]);
  patients$ = this.patientsSubject.asObservable();

  constructor(@Inject(FIRESTORE) private db: Firestore) {
    this.listenToPatients();
  }

  private listenToPatients() {
    const patientsRef = collection(this.db, 'patients');

    onSnapshot(patientsRef, (snapshot) => {
      const patients = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.patientsSubject.next(patients);
    });
  }

  getPatients() {
    return this.patients$;
  }
}
