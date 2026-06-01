import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth-service';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private db;

  private patientsSubject = new BehaviorSubject<any[]>([]);
  patients$ = this.patientsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.db = getFirestore(this.authService.app);
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
