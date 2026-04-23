import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as crypto from 'crypto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          const authHeader = req?.headers?.authorization;

          if (!authHeader) return null;

          const encryptedToken = authHeader.replace('Bearer ', '');

          try {
            const jwt = this.decrypt(encryptedToken); // 🔓 step 1
            return jwt; // return NORMAL JWT to passport
          } catch (err) {
            console.log('DECRYPT ERROR:', err.message);
            return null;
          }
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  private decrypt(token: string): string {
    const key = crypto
      .createHash('sha256')
      .update(process.env.ENCRYPT_KEY!)
      .digest();

    const [ivBase64, encryptedData] = token.split(':');

    if (!ivBase64 || !encryptedData) {
      throw new Error('Invalid token format');
    }

    const iv = Buffer.from(ivBase64, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  async validate(payload: any) {
    return {
      userId: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}