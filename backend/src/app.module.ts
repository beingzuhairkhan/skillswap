import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { SessionModule } from './session/session.module';
import { ChatModule } from './chat/chat.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  }),
  MongooseModule.forRoot(process.env.MONGO_URL!),
  AuthModule,
  UserModule,
  UploadModule,
  SessionModule,
  ChatModule,
  RoomModule ,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
