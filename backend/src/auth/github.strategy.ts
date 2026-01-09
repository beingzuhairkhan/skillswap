import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret:  process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    // Here you can save/find the user in your DB
    const user = {
      githubId: profile.id,
      username: profile.username,
      email: profile.emails[0]?.value,
      displayName: profile.displayName,
    };
    done(null, user);
  }
}
