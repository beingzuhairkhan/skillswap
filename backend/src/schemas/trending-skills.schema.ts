import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrendingSkillsDocument = TrendingSkills & Document;

@Schema({ timestamps: true })
export class TrendingSkills {
  @Prop({
    type: [
      {
        skill: { type: String, required: true },
        count: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  skills: {
    skill: string;
    count: number;
  }[];
}

export const TrendingSkillsSchema =
  SchemaFactory.createForClass(TrendingSkills);
