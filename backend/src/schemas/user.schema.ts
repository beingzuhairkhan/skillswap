import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import * as bcrypt from 'bcrypt'
export type UserDocument = User & Document;


export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

@Schema({ timestamps: true })
export class User {

    @Prop({ required: true, trim: true, unique: true })
    name: string;

    @Prop({ required: true, unique: true, trim: true, lowercase: true, index: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
    email: string;

    @Prop({ required: true, select: true })
    password: string;

    @Prop({ default: '' })
    collegeName: string;

    @Prop({ default: '' })
    domain?: string;

    @Prop({ default: '' })
    bio: string;

    @Prop({ default: 0 })
    ratings?: number;

    @Prop({ default: '' })
    leetcodeUsername?: string;

    @Prop({ default: '' })
    githubUsername?: string;

    @Prop({ default: '' })
    portfolioUrl?: string;

    @Prop({ default: '' })
    resume?: string; // store URL or path

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    follower: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    following: Types.ObjectId[];
    
    @Prop()
    imageUrl?: string;

    @Prop()
    publicId?: string;

    @Prop({ type: [String], default: [] })
    skillsToTeach: string[];

    @Prop({ type: [String], default: [] })
    skillsToLearn: string[];

    @Prop({ type: [String], default: [] })
    notifications: string[];

    @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.USER })
    role: UserRole;

    @Prop({ type: Boolean, default: false })
    isOnline: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();

    } catch (error) {
        next(error)
    }
})


// UserSchema.methods.comparePassword = async function (enteredPassword: string) {
//     return bcrypt.compare(enteredPassword, this.password);
// };



// @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
//   followers: string[];

//   @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
//   following: string[];