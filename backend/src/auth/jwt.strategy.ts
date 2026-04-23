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
          console.log('================ REQUEST DEBUG ================');
          console.log('HEADERS:', req?.headers);

          const authHeader = req?.headers?.authorization;

          console.log('AUTH HEADER:', authHeader);

          if (!authHeader) {
            console.log('❌ NO AUTH HEADER FOUND');
            return null;
          }

          const encryptedToken = authHeader.replace('Bearer ', '');

          console.log('ENCRYPTED TOKEN:', encryptedToken);

          try {
            const jwt = this.decrypt(encryptedToken);
            console.log('✅ DECRYPT SUCCESS:', jwt);
            return jwt;
          } catch (err) {
            console.log('❌ DECRYPT FAILED:', err.message);
            return null;
          }
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  private decrypt(token: string): string {
    const crypto = require('crypto');

    console.log('🔐 START DECRYPT');

    const [ivBase64, encryptedData] = token.split(':');

    console.log('IV BASE64:', ivBase64);
    console.log('ENCRYPTED DATA:', encryptedData);

    if (!ivBase64 || !encryptedData) {
      throw new Error('Invalid token format (missing :)');
    }

    const iv = Buffer.from(ivBase64, 'base64');

    const key = crypto
      .createHash('sha256')
      .update(process.env.ENCRYPT_KEY!)
      .digest();

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'base64')),
      decipher.final(),
    ]);

    const result = decrypted.toString('utf8');

    console.log('🔓 DECRYPTED RESULT:', result);

    return result;
  }

  async validate(payload: any) {
    console.log('🎯 JWT PAYLOAD:', payload);

    return {
      userId: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}