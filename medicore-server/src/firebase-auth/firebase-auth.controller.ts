import { Body, Controller, Post } from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';
import type { EmailandPasswordDto } from './loginDTO';

@Controller('firebase-auth')
export class FirebaseAuthController {
  constructor(private readonly authService: FirebaseAuthService) {}

  @Post('google-signin')
  async firebaseLogin(@Body() body: { token: string }) {
    return await this.authService.verifyFirebaseToken(body.token);
  }

  @Post('signup')
  async register(@Body() body: EmailandPasswordDto) {
    return await this.authService.createWithEmailAndPassword(body);
  }
}
