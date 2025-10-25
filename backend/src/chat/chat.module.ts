import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import {Post, PostSchema } from 'src/schemas/post.schema';
import { Chat, ChatSchema } from 'src/schemas/chat.schema';

@Module({
  imports:[
        MongooseModule.forFeature([{name:User.name , schema:UserSchema}]),
        MongooseModule.forFeature([{name:Post.name , schema:PostSchema}]),
        MongooseModule.forFeature([{name:Chat.name , schema:ChatSchema}])
  ],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
