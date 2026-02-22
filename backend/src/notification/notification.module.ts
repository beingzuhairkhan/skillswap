import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NotificationSchema,
  Notification,
} from 'src/schemas/notification.schema';
import { NotificationService } from './notification.service';
import { BullModule } from '@nestjs/bullmq';
import { redis } from './redis';

import './notification.listener';
import { User, UserSchema } from 'src/schemas/user.schema';
import { NotificationListener } from './notification.listener';
import { EmailWorkerService } from './email.worker';
import { RoomModule } from 'src/room/room.module';

@Module({
  imports: [
    RoomModule,
    BullModule.registerQueue({
      name: 'emailQueue',
    }),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: 'REDIS',
      useValue: redis,
    },
    NotificationListener,
    EmailWorkerService,
  ],
  exports: ['REDIS'],
})
export class NotificationModule {}
