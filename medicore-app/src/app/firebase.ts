import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

const firebaseOptions = (environment as any).firebase ?? (environment as any).firebaseConfig;
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseOptions);
export const db = getFirestore(firebaseApp);
