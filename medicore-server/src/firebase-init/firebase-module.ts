import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase-healthCheck-service';
import { FirebaseController } from './firebase-controller';
import { FirebaseProvider } from './firebase-provider';

@Module({
  providers: [FirebaseService, FirebaseProvider],
  controllers: [FirebaseController],
  exports: [FirebaseProvider],
})
export class FirebaseModule {}
