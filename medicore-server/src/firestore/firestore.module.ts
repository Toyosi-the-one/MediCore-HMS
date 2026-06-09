import { Module } from '@nestjs/common';
import { FirestoreController } from './firestore.controller';
import { FirestoreService } from './firestore.service';
import { FirebaseModule } from '../firebase-init/firebase-module';

@Module({
  imports: [FirebaseModule],
  controllers: [FirestoreController],
  providers: [FirestoreService],
})
export class FirestoreModule {}
