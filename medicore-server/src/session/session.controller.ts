import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}
  expiresIn = 1000 * 60 * 60;
  @Post()
  async sessionLogin(
    @Body() body: { idToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionCookie = await this.sessionService.createSession(
      body.idToken,
      this.expiresIn,
    );

    res.cookie('session', sessionCookie, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      // maxAge: this.expiresIn,
      path: '/', // ✅ add explicit path
    });

    return { message: 'Cookie set successfully', cookie: sessionCookie };
  }

  @Get()
  async sessionCheck(@Req() req: Request) {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const sessionCookie =
      typeof cookies?.session === 'string' ? cookies.session : undefined;

    if (!sessionCookie) {
      throw new UnauthorizedException('No session');
    }

    const result = await this.sessionService.verifySession(sessionCookie);

    if (!result.cookie) {
      throw new UnauthorizedException(result.message);
    }

    return { success: true, sessionCookie };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('session', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      // maxAge: this.expiresIn,
      path: '/', // ✅ add explicit path
    });

    return { message: 'Session cookie cleared' };
  }
} // ✅ one closing brace for the entire class
