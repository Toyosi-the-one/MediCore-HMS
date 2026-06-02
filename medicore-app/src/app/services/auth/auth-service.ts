import { Injectable, Inject } from '@angular/core';
import {
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { doc, getDoc, serverTimestamp, setDoc, Firestore } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { FIRESTORE } from '../../app.config';

interface SignupPayload {
  displayName: string | null;
  title: string | null;
  role: string | null;
  email: string | null;
  password: string | null;
}

interface Credentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();
  private provider = new GoogleAuthProvider();
  // 🔵 ROLE MODAL STATE
  public showRoleModal = false;
  public pendingUser: any = null;

  constructor(
    private http: HttpClient,
    public router: Router,
    @Inject(FIRESTORE) public db: Firestore,
  ) {}

  private createSession(idToken: string) {
    return this.http.post(`${environment.apiURL}/session`, { idToken }, { withCredentials: true });
  }
  async completeOnboarding(role: string, password: string) {
    if (!this.pendingUser) return;

    const user = this.pendingUser;
    const credentials = EmailAuthProvider.credential(user.email, password);
    await linkWithCredential(user, credentials);
    // 🔥 REFRESH USER AFTER LINKING
    await user.reload();
    const freshToken = await user.getIdToken(true);

    // 🔥 NOW create session AFTER everything is complete
    await firstValueFrom(this.createSession(freshToken));

    await setDoc(doc(this.db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role,
      createdAt: serverTimestamp(),
    });

    // 🧹 cleanup state
    this.pendingUser = null;
    this.showRoleModal = false;

    // 🚀 continue app
    this.router.navigate(['admin']);
  }
  private async checkUserExists(uid: string): Promise<boolean> {
    const userRef = doc(this.db, 'users', uid);
    const snap = await getDoc(userRef);
    return snap.exists();
  }

  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.provider);

      const user = result.user;

      // 🔥 DEBUG THIS FIRST
      console.log('Google user:', user);

      console.log('Email:', user.email);

      if (!user.email) {
        throw new Error('No email returned from Google account');
      }

      const idToken = await user.getIdToken();
      await firstValueFrom(this.createSession(idToken));

      const exists = await this.checkUserExists(user.uid);

      if (!exists) {
        this.pendingUser = user;
        this.showRoleModal = true;
        return;
      }

      this.router.navigate(['admin']);
    } catch (error) {
      console.error(error);
    }
  }
  // 🟢 EMAIL/PASSWORD SIGN IN
  async signIn(credentials: Credentials) {
    try {
      const response = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password,
      );

      const idToken = await response.user.getIdToken();

      await firstValueFrom (this.createSession(idToken)); // Wait for session

      console.log('Login + session successful');
      this.router.navigate(['admin']);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error; // ←←← THIS WAS MISSING!
    }
  }

  // SIGNUP
  createUserWithEmailAndPassword(payload: SignupPayload) {
    this.http.post(`${environment.apiURL}/firebase-auth/signup`, payload).subscribe({
      next: (res: any) => {
        console.log('Signup success:', res);
        alert('User created successfully!');
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.error('Signup error:', err);
        alert('Error creating user: ' + (err?.error?.message || err?.message || 'Unknown error'));
      },
    });
  }
}
