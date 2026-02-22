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
import { NotificationModule } from './notification/notification.module';
import { redis } from './notification/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URL!, {
      onConnectionCreate: (connection) => {
        connection.on('connected', () => {
          console.log('MongoDB connected successfully');
        });

        connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });

        return connection;
      },
    }),
    AuthModule,
    UserModule,
    UploadModule,
    SessionModule,
    ChatModule,
    RoomModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
