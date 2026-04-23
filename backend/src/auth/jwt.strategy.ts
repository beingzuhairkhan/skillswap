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
            return this.decrypt(encryptedToken); // 🔓 decrypt FIRS
          } catch (err) {
            return null;
          }
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  private decrypt(token: string): string {
    const algorithm = 'aes-256-cbc';

    const secretKey = crypto
      .createHash('sha256')
      .update(process.env.ENCRYPT_KEY!)
      .digest();

    const iv = Buffer.alloc(16, 0); 

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(token, 'base64')),
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