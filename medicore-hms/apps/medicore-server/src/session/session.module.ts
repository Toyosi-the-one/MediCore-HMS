import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { FirebaseModule } from '../firebase-init/firebase-module';

@Module({
  imports: [FirebaseModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
