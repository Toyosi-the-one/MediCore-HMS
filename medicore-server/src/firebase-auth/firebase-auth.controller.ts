import { Body, Controller, Post } from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';
import type { EmailandPasswordDto } from './loginDTO';
// By the way I wanted to setup logging in using email and password and email but I could
// only do it in Admin SDK by setting up a REST API which would require more boilerplate
// than I want to handle.
@Controller('firebase-auth')
/*The main controller for auth */
export class FirebaseAuthController {
  constructor(private readonly authService: FirebaseAuthService) {}
  /*  Important note here */
  // @Post(
  //   'googlesignin',
  // ) /*For verifying the token sent by the client after Google Sign-In*/
  // async firebaseLogin(@Body() body: { token: string }) {
  //   return await this.authService.verifyFirebaseToken(body.token);
  // }

  @Post('signup') /*For creating a user I am using Firebase Admin SDK*/
  async register(@Body() body: EmailandPasswordDto) {
    return await this.authService.createWithEmailAndPassword(body);
  }
}
