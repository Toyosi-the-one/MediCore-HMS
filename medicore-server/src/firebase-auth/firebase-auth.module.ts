import { Module } from '@nestjs/common';

import { FirebaseAuthController } from './firebase-auth.controller';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseModule } from '../firebase-init/firebase-module';

@Module({
  imports: [FirebaseModule],
  controllers: [FirebaseAuthController],
  providers: [FirebaseAuthService],
  exports: [FirebaseModule],
})
export class FirebaseAuthModule {}
