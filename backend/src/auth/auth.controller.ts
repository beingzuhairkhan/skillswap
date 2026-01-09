import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { SignupDto } from './dto/signup.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto): Promise<SignupDto> {
        return this.authService.signUp(signupDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
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
    async refresh(@Body('refreshToken') refreshToken: string, @Res({ passthrough: true }) res: Response) {
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
    async githubLogin() {
    }

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubCallback(@Req() req: import('express').Request & { user?: any }, @Res({ passthrough: true }) res: Response) {
        const { user, tokens } = await this.authService.githubCallback(req.user)
        res.redirect(`http://localhost:3000/oauth?token=${tokens.accessToken}`);

    }
}
// github {
//   githubId: '144715213',
//   username: 'beingzuhairkhan',
//   email: 'zuhairkhan5134@gmail.com',
//   displayName: null
// }