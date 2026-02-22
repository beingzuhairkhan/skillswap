import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type PostDocument = Post & Document;
export enum PostStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ type: String, trim: true })
  wantToLearn: string;

  @Prop({ type: String, trim: true })
  wantToTeach: string;

  @Prop({ default: '' })
  specificTopic: string;

  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.PENDING,
  })
  postStatus: PostStatus;

  @Prop({ default: '' })
  postImageUrl: string;

  @Prop({ default: '' })
  postImagePublicId: string;

  @Prop({ default: '' })
  postUrl: string;

  @Prop({ default: '' })
  postPdf: string;

  @Prop({ type: [String], default: [] })
  trendingSkills: string[];

  @Prop({ type: [Types.ObjectId], ref: User.name, default: [] })
  likes: Types.ObjectId[];

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: User.name },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments: { user: Types.ObjectId; text: string; createdAt: Date }[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
