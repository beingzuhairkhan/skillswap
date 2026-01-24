import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { Session, SessionDocument } from 'src/schemas/session.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import fs from 'fs'
import { RoomGateway } from './room.gateway';
import { Transcript, TranscriptDocument } from 'src/schemas/transcript.schema';
import { Feedback, FeedbackDocument, MeetingStatus } from 'src/schemas/feedback.schema';
@Injectable()
export class RoomService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>,
        @InjectModel(Transcript.name) private readonly transcriptModel: Model<TranscriptDocument>,
        @InjectModel(Feedback.name) private readonly feedbackModel: Model<FeedbackDocument>,
        private jwtService: JwtService,
        private readonly roomGateway: RoomGateway
    ) { }

    async decodeMeetLink(meetLink: string, userId: string): Promise<any> {
        try {
            if (!userId || !meetLink) throw new NotFoundException('User or meet link not found');

            const token = meetLink.split('/').pop();
            if (!token) {
                throw new NotFoundException('Invalid meet link');
            }
            const decoded = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET as string,
            });

            // if (decoded.requesterId !== userId || decoded.receiverId !== userId) {
            //     return { status: false, message: 'This link does not belong to you' };
            // }

            return { status: true, token };
        } catch (error) {
            throw new InternalServerErrorException(error.message || 'Failed to decode meet link');
        }
    }


    async decodeMeetLinkFromRoom(meetLink: string): Promise<any> {
        try {
            if (!meetLink) throw new NotFoundException('Meet link not provided');

            const token = meetLink.split('/').pop();
            if (!token) throw new NotFoundException('Invalid meet link');

            const decoded: any = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });

            const { receiverId, requesterId, sessionId } = decoded;

            const receiver = await this.userModel.findById(receiverId).select('-password'); // exclude password
            const requester = await this.userModel.findById(requesterId).select('-password');
            const postId = await this.sessionModel.findById(sessionId);

            if (!receiver || !requester || !postId) {
                throw new NotFoundException('User(s) or post not found');
            }

            const roomId = `${receiverId}-${requesterId}-${postId._id}`;

            return {
                status: true,
                roomId
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message || 'Failed to decode meet link');
        }
    }


    async convertAudioToText(file: Express.Multer.File, roomId, speakerId, speakerRole) {
        try {
            if (!file) {
                throw new Error('No file provided');
            }

            const groqRes = await this.roomGateway.transcribeGenerate(file);
            const transcriptText = groqRes.text;

            const transcript = await this.transcriptModel.create({
                roomId,
                speakerId,
                speakerRole,
                language: 'hi',
                audioFilePath: file.originalname,
                transcription: transcriptText,
                summary: await this.roomGateway.transcribeSummarize(transcriptText)
            });
            console.log("final ", transcript)

            return transcript;


        } catch (error) {
            throw new InternalServerErrorException(error.message || "failed to covert audio into text")
        }
    }

    async saveFeedback(data: any) {
        try {
            const [receiverId, requesterId, postId] = data.roomId.split('-');

            const feedback = new this.feedbackModel({
                roomId: data.roomId,
                currentUserId: data.currentUserId ? new Types.ObjectId(data.currentUserId) : new Types.ObjectId(requesterId),
                otherUserId: data.otherUserId ? new Types.ObjectId(data.otherUserId) : new Types.ObjectId(receiverId),
                postId: data.postId ? new Types.ObjectId(data.postId) : new Types.ObjectId(postId),
                rating: data.rating,
                category: data.category,
                message: data.message || '',
                status: data.status || MeetingStatus.COMPLETED,
                timestamp: new Date(),
            });

            return await feedback.save();
        } catch (error) {
            console.error('Failed to save feedback:', error);
            throw new Error('Could not save feedback');
        }
    }

    async getUserReviews(otherUserId: string) {
        const reviews = await this.feedbackModel.aggregate([
            {
                $match: { otherUserId: new Types.ObjectId(otherUserId) }
            },

            {
                $lookup: {
                    from: 'users', 
                    localField: 'currentUserId',
                    foreignField: '_id',
                    as: 'currentUserInfo',
                },
            },

            { $unwind: '$currentUserInfo' },

            {
                $project: {
                    _id: 1,
                    roomId: 1,
                    rating: 1,
                    category: 1,
                    message: 1,
                    timestamp: 1,
                    currentUser: {
                        _id: '$currentUserInfo._id',
                        name: '$currentUserInfo.name',
                        imageUrl: '$currentUserInfo.imageUrl',
                    },
                },
            },

            { $sort: { timestamp: -1 } },
        ]);

        return reviews;
    } catch(error) {
        throw new Error('Failed to fetch reviews', error);
    }


}

