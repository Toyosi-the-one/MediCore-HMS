import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAuthError } from 'firebase-admin/auth';

export function handleFirebaseAuthError(error: FirebaseAuthError): never {
  const code = error?.code;

  switch (code) {
    case 'auth/email-already-exists':
      throw new BadRequestException('Email already exists');

    case 'auth/user-not-found':
      throw new BadRequestException('User not found');

    case 'auth/wrong-password':
      throw new UnauthorizedException('Invalid credentials');

    case 'auth/invalid-id-token':
      throw new UnauthorizedException('Invalid token');

    default:
      throw new InternalServerErrorException(
        error?.message || 'Firebase error',
      );
  }
}
