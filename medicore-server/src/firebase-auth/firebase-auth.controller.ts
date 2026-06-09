import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';
import type { EmailandPasswordDto } from './loginDTO';
import { SessionGuard } from '../session/session.guard';
import type { Request } from 'express';

@Controller('firebase-auth')
export class FirebaseAuthController {
  constructor(private readonly authService: FirebaseAuthService) {}

  @Post('signup')
  async register(@Body() body: EmailandPasswordDto) {
    return this.authService.createWithEmailAndPassword(body);
  }

  @UseGuards(SessionGuard)
  @Get('me')
  async getMe(@Req() req: Request & { user?: { uid?: string } }) {
    const uid = req.user?.uid;
    if (!uid) throw new UnauthorizedException('No authenticated user');
    return this.authService.getUserProfile(uid);
  }
}
