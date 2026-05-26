import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private firebaseApp: admin.app.App,
  ) {}

  async healthCheck() {
    try {
      await this.firebaseApp.auth().listUsers(1);

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
}
