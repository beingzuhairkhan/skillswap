import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-http.guard';
import {
  Notification,
  NotificationDocument,
} from 'src/schemas/notification.schema';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  @Get()
  async getMyNotification(@Req() req: any) {
    try {
      const userId = req.user.userId;

      return await this.notificationModel
        .find({
          userId: new Types.ObjectId(userId),
          isRead: false,
        })
        .sort({ createdAt: -1 });

      // .limit(10);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to fetch notifications',
      );
    }
  }

  @Patch(':id/read')
  async markRead(@Req() req: any, @Param('id') id: string) {
    try {
      const userId = req.user.userId;

      return await this.notificationModel.findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { isRead: true },
        { new: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to mark notification as read',
      );
    }
  }

  @Get('unread/count')
  async unreadCount(@Req() req: any) {
    try {
      const userId = req.user.userId;

      return await this.notificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: false,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to fetch unread count',
      );
    }
  }
}
