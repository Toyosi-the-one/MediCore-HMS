import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

export const FirebaseAdminProvider: Provider = {
  provide: 'FIREBASE_ADMIN',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    if (admin.apps.length) return admin.app();

    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.get('FIREBASE_PROJECT_ID'),
        clientEmail: config.get('FIREBASE_CLIENT_EMAIL'),
        privateKey: config
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      }),
    });
  },
};

export const FirebaseFirestoreProvider: Provider = {
  provide: 'FIRESTORE',
  inject: ['FIREBASE_ADMIN'],
  useFactory: (app: admin.app.App) => {
    return admin.firestore(app);
  },
};
