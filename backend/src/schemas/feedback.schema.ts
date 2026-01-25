import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

export enum MeetingStatus {
    COMPLETE = 'complete',
    SKIPPED = 'skipped',
    PENDING = 'pending'
}

@Schema({ timestamps: true })
export class Feedback {
    @Prop({ required: false })
    roomId: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    currentUserId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    otherUserId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Session' })
    postId: Types.ObjectId;

    @Prop({ required: false, min: 1, max: 5 })
    rating: number;

    @Prop({ required: false })
    category: string;

    @Prop({ default: '' })
    message: string;

    @Prop({ required: false })
    timestamp: Date;

    @Prop({
        type: String,
        enum: Object.values(MeetingStatus),
        default: MeetingStatus.PENDING,
    })
    status: MeetingStatus;

    
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
