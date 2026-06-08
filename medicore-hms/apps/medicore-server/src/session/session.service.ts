import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import * as admin from 'firebase-admin';

@Injectable()
export class SessionService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: admin.app.App,
  ) {}

  async createSession(idToken: string, expiresIn: number) {
    try {
      return await this.firebaseAdmin
        .auth()
        .createSessionCookie(idToken, { expiresIn });
    } catch {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }

  async verifySession(sessionCookie: string) {
    if (!sessionCookie) {
      return {
        cookie: false,
        message: 'No session cookie found',
        string: sessionCookie,
      };
    }

    try {
      await this.firebaseAdmin.auth().verifySessionCookie(sessionCookie, true);

      return { cookie: true };
    } catch {
      return {
        cookie: false,
        message: 'Invalid session cookie',
      };
    }
  }
}
