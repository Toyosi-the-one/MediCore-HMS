import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import type { Request } from 'express';

import * as admin from 'firebase-admin';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const typedReq = req as Request & {
      cookies?: Record<string, unknown>;
      user?: admin.auth.DecodedIdToken;
    };

    const cookies = typedReq.cookies as Record<string, unknown> | undefined;
    const sessionCookie =
      typeof cookies?.session === 'string' ? cookies.session : undefined;

    if (!sessionCookie) {
      throw new UnauthorizedException('No session');
    }

    const decoded = await this.firebaseAdmin
      .auth()
      .verifySessionCookie(sessionCookie, true);

    typedReq.user = decoded;

    return true;
  }
}
