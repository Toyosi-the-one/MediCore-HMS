import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient' | null;
  photoURL?: string | null;
}

@Injectable()
export class FirebaseService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private firebase: {
      app: admin.app.App;
      auth: admin.auth.Auth;
      firestore: admin.firestore.Firestore;
    },
  ) {}

  async healthCheck() {
    try {
      await this.firebase.auth.listUsers(1);

      return {
        status: 'ok',
        firebase: true,
        usersSampleChecked: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      return {
        status: 'error',
        firebase: false,
        message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🔥 MAIN USER FETCH LOGIC
  async getUserProfile(uid: string): Promise<UserDoc> {
    const [authUser, userDoc] = await Promise.all([
      this.firebase.auth.getUser(uid),
      this.firebase.firestore.collection('users').doc(uid).get(),
    ]);

    const dbData = userDoc.data() as { role?: UserDoc['role'] };

    return {
      uid: authUser.uid,
      email: authUser.email ?? '',
      displayName: authUser.displayName ?? '',
      photoURL: authUser.photoURL ?? null,
      role: dbData.role ?? null,
    };
  }
}
