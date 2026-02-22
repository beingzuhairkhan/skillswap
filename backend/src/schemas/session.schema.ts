import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Post } from '@nestjs/common';

export enum SessionStatus {
  ACCEPT = 'accept',
  PENDING = 'pending',
  REJECT = 'reject',
  COMPLETE = 'complete',
}

export enum SessionType {
  ONE_ON_ONE = '1-on-1',
  GROUP = 'group',
  BROADCAST = 'broadcast',
}

export enum DurationTime {
  MIN_30 = '30',
  MIN_60 = '60',
  MIN_90 = '90',
  MIN_120 = '120',
  MIN_150 = '150',
  MIN_180 = '180',
}

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  // User who requested the session
  @Prop({ type: Types.ObjectId, ref: 'User' })
  requesterId: Types.ObjectId;

  // User who receives the session request
  @Prop({ type: Types.ObjectId, ref: 'User' })
  receiverId: Types.ObjectId;

  // Associated post (optional, if session is based on a post)
  @Prop({ type: Types.ObjectId, ref: 'Post' })
  postId: Types.ObjectId;

  // Session type (e.g., 1-on-1, group)
  @Prop({ type: String, enum: SessionType, default: SessionType.ONE_ON_ONE })
  sessionType: SessionType;

  @Prop({ type: String, enum: DurationTime, default: DurationTime.MIN_120 })
  durationTime: DurationTime;

  // Date and time of the session
  @Prop({ type: String, required: true })
  date: string;

  @Prop({ type: String, required: true })
  time: string;

  // Specific topic of the session
  @Prop({ type: String })
  studentNotes: string;

  // Status of the session
  @Prop({ type: String, enum: SessionStatus, default: SessionStatus.PENDING })
  status: SessionStatus;

  // Google Meet / custom session link
  @Prop({ type: String })
  googleMeetLink: string;

  // Feedback after session completion
  @Prop({ type: String })
  feedback: string;

  // Optional: rating given after session
  @Prop({ type: Number, min: 0, max: 5 })
  rating?: number;

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
