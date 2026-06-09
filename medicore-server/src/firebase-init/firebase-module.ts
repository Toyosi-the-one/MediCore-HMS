import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase-healthCheck-service';
import { FirebaseController } from './firebase-controller';
import {
  FirebaseAdminProvider,
  FirebaseFirestoreProvider,
} from './firebase-provider';

@Module({
  providers: [
    FirebaseService,
    FirebaseAdminProvider,
    FirebaseFirestoreProvider,
  ],
  controllers: [FirebaseController],
  exports: [FirebaseAdminProvider, FirebaseFirestoreProvider],
})
export class FirebaseModule {}
