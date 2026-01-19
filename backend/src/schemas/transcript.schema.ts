import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranscriptDocument = Transcript & Document;

@Schema({ timestamps: true }) 
export class Transcript {
  @Prop({ required: true, index: true })
  roomId: string;

  @Prop({ required: true })
  speakerId: string;

  @Prop({ required: true })
  speakerRole: string;

  @Prop({ default: 'hi' })
  language: string;

  @Prop({ required: true })
  audioFilePath: string;

  @Prop({ required: true })
  transcription: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ type: Array, default: [] })
  segments?: { start: number; end: number; text: string }[]; 
}

export const TranscriptSchema = SchemaFactory.createForClass(Transcript);
