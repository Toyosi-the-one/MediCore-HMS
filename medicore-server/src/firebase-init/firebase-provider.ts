import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

export const FirebaseProvider: Provider = {
  provide: 'FIREBASE_ADMIN',
  inject: [ConfigService],

  useFactory: (config: ConfigService) => {
    if (admin.apps.length) {
      return admin.app();
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.get<string>('FIREBASE_PROJECT_ID'),
        clientEmail: config.get<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: config
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      }),
    });

    // Initialize Firestore
    const firestore = admin.firestore(app);
    return app;
  },
};

export const FirestoreProvider: Provider = {
  provide: 'FIRESTORE',
  inject: ['FIREBASE_ADMIN'],
  useFactory: (firebaseApp: admin.app.App) => {
    return admin.firestore(firebaseApp);
  },
};
