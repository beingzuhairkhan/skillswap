import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): any {
    const req = context.switchToHttp().getRequest();
    // console.log("User data from auth guard :" , user)
     console.log('================ GUARD DEBUG ================');
    console.log('ERROR:', err);
    console.log('USER:', user);
    console.log('INFO:', info);

    if (err || !user) {
      const message =
        err?.message || info?.message || 'Invalid or missing token';
      throw new UnauthorizedException(message);
    }
    return user;
  }
}
