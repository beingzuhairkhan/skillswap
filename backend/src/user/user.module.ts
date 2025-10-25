import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UploadModule } from 'src/upload/upload.module';
import {Post, PostSchema } from 'src/schemas/post.schema';

@Module({
  imports:[
  UploadModule,
    MongooseModule.forFeature([{name:User.name , schema:UserSchema}]),
    MongooseModule.forFeature([{name:Post.name , schema:PostSchema}]),
    PassportModule.register({defaultStrategy:'jwt'}),
    JwtModule.register({}),

  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
