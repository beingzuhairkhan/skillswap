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
            console.log("T", token)

            const decoded = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET as string,
            });
            console.log("d", decoded, userId)

            // if (decoded.requesterId !== userId || decoded.receiverId !== userId) {
            //     return { status: false, message: 'This link does not belong to you' };
            // }

            return { status: true , token };
        } catch (error) {
            throw new InternalServerErrorException(error.message || 'Failed to decode meet link');
        }
    }


    async decodeMeetLinkFromRoom(meetLink: string): Promise<any> {
        try {
            if (!meetLink) throw new NotFoundException('Meet link not provided');

            // Extract token from the URL
            const token = meetLink.split('/').pop();
            if (!token) throw new NotFoundException('Invalid meet link');
             console.log("url hit from  room")
            // Decode JWT token
            const decoded: any = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });

            const { receiverId, requesterId } = decoded;

            // Find users in DB
            const receiver = await this.userModel.findById(receiverId).select('-password'); // exclude password
            const requester = await this.userModel.findById(requesterId).select('-password');

            if (!receiver || !requester) {
                throw new NotFoundException('User(s) not found');
            }

            // Generate a room ID (or use your existing logic)
            const roomId = `${receiverId}-${requesterId}`;

            return {
                status: true,
                roomId,
                users: [
                    {
                        _id: receiver._id,
                        name: receiver.name,
                        imageUrl: receiver.imageUrl,
                        email: receiver.email,
                        collegeName: receiver.collegeName,
                        domain: receiver.domain,
                        bio: receiver.bio,
                        leetcodeUsername: receiver.leetcodeUsername,
                        githubUsername: receiver.githubUsername,
                        portfolioUrl: receiver.portfolioUrl,
                        resume: receiver.resume,
                        role: receiver.role,
                    },
                    {
                        _id: requester._id,
                        name: requester.name,
                        imageUrl: requester.imageUrl,
                        email: requester.email,
                        collegeName: requester.collegeName,
                        domain: requester.domain,
                        bio: requester.bio,
                        leetcodeUsername: requester.leetcodeUsername,
                        githubUsername: requester.githubUsername,
                        portfolioUrl: requester.portfolioUrl,
                        resume: requester.resume,
                        role: requester.role,
                    }
                ],
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message || 'Failed to decode meet link');
        }
    }

}
