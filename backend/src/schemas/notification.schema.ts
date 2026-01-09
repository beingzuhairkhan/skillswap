import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationRole {
  BOOKING = 'BOOKING',
  REMINDER = 'REMINDER',
  CANCELLED = 'CANCELLED',
  SYSTEM = 'SYSTEM',
}

@Schema({ timestamps: true })
export class Notification {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: Object.values(NotificationRole),
    default: NotificationRole.SYSTEM,
    index: true,
  })
  type: NotificationRole;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ default: null })
  link?: string;


  @Prop({ type: String, required: false })
  typeSession: string; // e.g. SESSION_CREATED
}

export const NotificationSchema =
  SchemaFactory.createForClass(Notification);
