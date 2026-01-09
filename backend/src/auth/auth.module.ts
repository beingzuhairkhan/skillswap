import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy'
import { GithubStrategy } from './github.strategy';
@Module({
  imports:[
    MongooseModule.forFeature([{name:User.name , schema :UserSchema}]),
    PassportModule.register({defaultStrategy: 'jwt' }),
    JwtModule.register({})
  ],
  controllers: [AuthController ],
  providers: [AuthService , JwtStrategy , GithubStrategy],

})
export class AuthModule {}
