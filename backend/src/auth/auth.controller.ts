import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { SignupDto } from './dto/signup.dto';
import { AuthGuard } from '@nestjs/passport';
import axios from 'axios';
import qs from 'qs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<SignupDto> {
    return this.authService.signUp(signupDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(loginDto);
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return { user, tokens };
  }

  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.generateNewRefreshToken(refreshToken);
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return tokens;
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: import('express').Request & { user?: any },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.githubCallback(req.user);
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth?token=${tokens.accessToken}`,
    );
  }

  @Get('google')
  googleAuthRedirect(@Res() res: Response) {
    const url =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      '?client_id=' +
      process.env.GOOGLE_CLIENT_ID +
      '&redirect_uri=' +
      encodeURIComponent(`${process.env.BACKEND_URL}/auth/google/callback`) +
      '&response_type=code' +
      '&scope=openid email profile' +
      '&access_type=offline';

    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    const tokenResponse = await axios.post(
      `${process.env.GOOGLE_OAUTH}`,
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BACKEND_URL}/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { id_token } = tokenResponse.data;

    const { user, tokens } = await this.authService.googleLogin(id_token);
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth?token=${tokens.accessToken}`,
    );
  }
}
