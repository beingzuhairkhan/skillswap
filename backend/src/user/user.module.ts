import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UploadModule } from 'src/upload/upload.module';
import {Post, PostSchema } from 'src/schemas/post.schema';
import { Feedback, FeedbackSchema } from 'src/schemas/feedback.schema';
import { TrendingSkills, TrendingSkillsSchema } from 'src/schemas/trending-skills.schema';

@Module({
  imports:[
  UploadModule,
    MongooseModule.forFeature([{name:User.name , schema:UserSchema},
      {name:Post.name , schema:PostSchema},
      {name:Feedback.name, schema:FeedbackSchema },
      {name:TrendingSkills.name, schema:TrendingSkillsSchema },
    ]),
    PassportModule.register({defaultStrategy:'jwt'}),
    JwtModule.register({}),

  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
