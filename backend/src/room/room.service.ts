import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { Session, SessionDocument } from 'src/schemas/session.schema';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class RoomService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>,
        private jwtService: JwtService
    ) { }

    async decodeMeetLink(meetLink: string, userId: string): Promise<any> {
        try {
            if (!userId || !meetLink) throw new NotFoundException('User or meet link not found');

            // Extract token from full link
            const token = meetLink.split('/').pop();
            if (!token) {
                throw new NotFoundException('Invalid meet link');
            }
            //console.log("T" , token)

            // const decoded = this.jwtService.verify(token, {
            //     secret: process.env.JWT_ACCESS_SECRET as string,
            // });
            //console.log("d" , decoded , userId)

            // if (decoded.receiverId !== userId ) {
            //     return { status: false, message: 'This link does not belong to you' };
            // }

            return { status: true };
        } catch (error) {
            throw new InternalServerErrorException(error.message || 'Failed to decode meet link');
        }
    }
}
