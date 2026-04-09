import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import {Post} from './post.schema';


export type SavedDocument = Save & Document ;

@Schema({timestamps:true})
export class Save {
   @Prop({ type: Types.ObjectId, ref: User.name, required: true })
   user:Types.ObjectId;

   @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
   Post: Types.ObjectId;
}


export const SaveSchema = SchemaFactory.createForClass(Save);