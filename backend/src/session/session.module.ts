import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { UploadModule } from 'src/upload/upload.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { Session, SessionSchema } from 'src/schemas/session.schema';
import { Chat, ChatSchema } from 'src/schemas/chat.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Feedback, FeedbackSchema } from 'src/schemas/feedback.schema';

@Module({
  imports: [
    UploadModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Chat.name, schema: ChatSchema }, 
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  providers: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}
