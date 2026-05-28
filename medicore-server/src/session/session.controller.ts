import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response, Request } from 'express';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async sessionLogin(
    @Body() body: { idToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const expiresIn = 1000 * 60 * 5;

    const sessionCookie = await this.sessionService.createSession(
      body.idToken,
      expiresIn,
    );

    res.cookie('session', sessionCookie, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: expiresIn,
    });

    return { message: 'Cookie set successfully' };
  }

  @Get()
  sessionCheck(@Req() req: Request) {
    const sessionCookie = req.cookies.session;

    return this.sessionService.verifySession(sessionCookie);
  }
}
