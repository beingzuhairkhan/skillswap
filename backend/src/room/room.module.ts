import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { Session, SessionSchema } from 'src/schemas/session.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RoomGateway } from './room.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  providers: [RoomService, RoomGateway],
  controllers: [RoomController],
  exports:[RoomGateway]
})
export class RoomModule { }
