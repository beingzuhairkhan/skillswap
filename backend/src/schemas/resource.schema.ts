import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResourceDocument = Resource & Document;

@Schema({ timestamps: true })
export class Resource {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  postId: Types.ObjectId;

  @Prop({ required: false })
  resourcePDF: string;

  @Prop({ required: false })
  resourceURL: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
