import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  app = initializeApp(environment.firebaseConfig);
  private auth = getAuth();
  private provider = new GoogleAuthProvider();
  Googlelogin() {
    const apiURL = environment.apiURL;

    signInWithPopup(this.auth, this.provider)
      .then(async (result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        console.log(credential);

        const idToken = await result.user.getIdToken();

        const user = result.user;
        console.log(user);

        this.http
          .post(`${apiURL}/firebase-auth/googlesignin`, {
            token: idToken,
          })
          .subscribe({
            next: (response) => console.log(response),
            error: (err) => console.log(err),
          });
      })
      .catch((error) => {
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
      });
  }
  // signup(user: { email: string; password: string }) {
  //   return createUserWithEmailAndPassword(auth, user.email, user.password);
  // }

  // logout() {
  //   return signOut(auth);
  // }
}
