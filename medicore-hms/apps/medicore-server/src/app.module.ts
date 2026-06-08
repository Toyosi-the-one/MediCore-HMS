import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase-init/firebase-module';
import { FirebaseAuthController } from './firebase-auth/firebase-auth.controller';
import { FirebaseAuthService } from './firebase-auth/firebase-auth.service';
import { FirebaseAuthModule } from './firebase-auth/firebase-auth.module';
import { SessionModule } from './session/session.module';
import { FirestoreModule } from './firestore/firestore.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseModule,
    FirebaseAuthModule,
    SessionModule,
    FirestoreModule,
  ],
  controllers: [AppController, FirebaseAuthController],
  providers: [AppService, FirebaseAuthService],
})
export class AppModule {}
