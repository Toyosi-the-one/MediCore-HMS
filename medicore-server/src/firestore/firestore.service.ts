import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirestoreService {
  constructor(
    @Inject('FIRESTORE')
    private readonly db: admin.firestore.Firestore,
  ) {}

  async getPatientsCollection() {
    const snapshot = await this.db.collection('patients').get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
