import { Controller, Get } from '@nestjs/common';
import { FirebaseService } from './firebase-healthCheck-service';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get('health')
  health() {
    return this.firebaseService.healthCheck();
  }
}
