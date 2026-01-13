import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import eventBus from './eventBus';
import { EVENTS } from './eventTypes';
import { emailQueue } from './email.queue';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Notification, NotificationDocument, NotificationRole } from 'src/schemas/notification.schema';
import { Server } from 'socket.io'; 
import { RoomGateway  } from '../room/room.gateway'

@Injectable()
export class NotificationListener implements OnModuleInit {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
      private roomGateway: RoomGateway ,
  ) {}

  onModuleInit() {
    console.log('📣 NotificationListener registered');
    this.registerListener();
  }

  private registerListener() {
    eventBus.on(EVENTS.SESSION_CREATED, async (payload) => {
      try {
        const { receiverId, date, time, sessionId , sessionData } = payload;

        await this.notificationModel.create({
          userId: receiverId,
          title: 'New Session Booked',
          message: `You have a new session booked for ${date} at ${time}.`,
          type: NotificationRole.BOOKING,
        });

        const user = await this.userModel
          .findById(receiverId)
          .select('email name')
          .lean();

        if (!user?.email) return;

        this.roomGateway.server.to(receiverId.toString()).emit('notification', {
          title: 'New Session Booked',
          message: `You have a new session booked for ${date} at ${time}.`,
          session: {
            sessionId,
            date,
            time,
            status: sessionData.status,
            sessionType: sessionData.sessionType,
          },
        });

        const ok = await emailQueue.add('send-session-email', {
          toEmail: user.email,
          subject: 'New Session Booked 🎉',
          userName: user.name,
          session: { 
            sessionId, 
            date,
            time,
            status:sessionData.status,
            sessionType:sessionData.sessionType,
         },
          template: 'SESSION_BOOKED',
        });

      } catch (err) {
        console.error(' SESSION_CREATED handler error:', err);
      }
    });
  }
}

