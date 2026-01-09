import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({required:false})
  roomId?:string;

  @Prop({ type: Date, default: Date.now })
  sentAt: Date;

  @Prop({ type: Boolean, default: false })
  read: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user1: Types.ObjectId; // one participant

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user2: Types.ObjectId; // other participant

  @Prop({ type: [ChatMessageSchema], default: [] })
  messages: ChatMessage[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
