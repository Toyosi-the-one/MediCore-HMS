import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
<<<<<<< HEAD
import { provideHttpClient } from '@angular/common/http';
=======
>>>>>>> 3f8422f65d94c599d895ecf7d7ad39de852615c6
import { routes } from './app.routes';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

import { InjectionToken } from '@angular/core';
import { Firestore } from 'firebase/firestore';

/**
 * Create Firebase app instance
 */
const firebaseApp = initializeApp(environment.firebaseConfig);

/**
 * Create Firestore instance
 */
const firestore = getFirestore(firebaseApp);

/**
 * Injection token so you can inject Firestore like Angular style
 */
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
<<<<<<< HEAD
    provideHttpClient(),

    // Provide Firestore manually
    { provide: FIRESTORE, useValue: firestore },
  ],
=======
  ]
>>>>>>> 3f8422f65d94c599d895ecf7d7ad39de852615c6
};
