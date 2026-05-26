import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
//import { FirebaseAuthError } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAuthService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: admin.app.App,
  ) {}

  async verifyFirebaseToken(token: string) {
    try {
      const decoded = await this.firebaseAdmin.auth().verifyIdToken(token);

      const uid = String(decoded.uid || '');
      const name = String(decoded.name || '');
      const email = String(decoded.email || '');
      const picture = String(decoded.picture || '');

      return {
        message: 'Token verified successfully',
        user: { uid, name, email, picture },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('🔥 Token verification error:', errorMessage);
      throw error;
    }
  }

  async createWithEmailAndPassword({
    firstName,
    lastName,
    email,
    password,
    role,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  }) {
    try {
      const displayName = `${firstName} ${lastName}`;
      console.log('📝 Creating user with:', {
        email,
        firstName,
        lastName,
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
          firstName,
          lastName,
          role,
          displayName,
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
}
