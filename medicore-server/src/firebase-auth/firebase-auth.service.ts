import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
//import { FirebaseAuthError } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAuthService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: admin.app.App,
  ) {}

  // async verifyFirebaseToken(token: string) {
  //   try {
  //     const decoded = await this.firebaseAdmin.auth().verifyIdToken(token);

  //     const uid = String(decoded.uid || '');
  //     const name = String(decoded.name || '');
  //     const email = String(decoded.email || '');
  //     const picture = String(decoded.picture || '');

  //     return {
  //       message: 'Token verified successfully',
  //       user: { uid, name, email, picture },
  //     };
  //   } catch (error: unknown) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : String(error);
  //     console.error('🔥 Token verification error:', errorMessage);
  //     throw error;
  //   }
  // }

  async createWithEmailAndPassword({
    displayName,
    email,
    password,
    role,
  }: {
    displayName: string;
    email: string;
    password: string;
    role: string;
  }) {
    try {
      console.log('📝 Creating user with:', {
        email,
        displayName,
        role,
      });

      // 1. Create Firebase Auth user
      const user = await this.firebaseAdmin.auth().createUser({
        email,
        password,
        displayName,
      });
      console.log('✅ Firebase Auth user created:', user.uid);

      // 2. Create Firestore profile
      await this.firebaseAdmin
        .firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          uid: user.uid,
          email: user.email,
          displayName,
          role,
          createdAt: new Date(),
        });
      console.log('✅ Firestore profile created for user:', user.uid);

      // 3. ALWAYS return response
      return {
        message: 'User created successfully',
        user: user,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN';
      if (error instanceof Error && 'code' in error) {
        const code = (error as Record<string, unknown>).code;
        errorCode = typeof code === 'string' ? code : 'UNKNOWN';
      }

      console.error('❌ Signup error:', errorMessage);
      console.error('Error code:', errorCode);
      console.error('Full error:', error);

      throw error;
    }
  }
  async getUserProfile(uid: string) {
    const userRef = this.firebaseAdmin.firestore().collection('users').doc(uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        exists: false,
        message: 'User does not exist in Firestore',
      };
    }

    const data = userDoc.data();

    const email = typeof data?.email === 'string' ? data.email : null;
    const displayName =
      typeof data?.displayName === 'string' ? data.displayName : null;
    const role = typeof data?.role === 'string' ? data.role : null;
    const photoURL = typeof data?.photoURL === 'string' ? data.photoURL : null;
    let createdAt: Date | null = null;
    const createdRaw = data?.createdAt as unknown;

    function isTimestamp(v: unknown): v is FirebaseFirestore.Timestamp {
      return !!v && typeof (v as Record<string, unknown>).toDate === 'function';
    }

    if (createdRaw instanceof Date) {
      createdAt = createdRaw;
    } else if (isTimestamp(createdRaw)) {
      createdAt = createdRaw.toDate();
    }

    return {
      exists: true,
      uid,
      email,
      displayName,
      role,
      photoURL,
      createdAt,
    };
  }
}
