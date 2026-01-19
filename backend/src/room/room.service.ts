import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { Session, SessionDocument } from 'src/schemas/session.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import fs from 'fs'
import { RoomGateway } from './room.gateway';
import { Transcript, TranscriptDocument } from 'src/schemas/transcript.schema';
import { Feedback, FeedbackDocument } from 'src/schemas/feedback.schema';
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

            const { receiverId, requesterId } = decoded;

            const receiver = await this.userModel.findById(receiverId).select('-password'); // exclude password
            const requester = await this.userModel.findById(requesterId).select('-password');

            if (!receiver || !requester) {
                throw new NotFoundException('User(s) not found');
            }

            const roomId = `${receiverId}-${requesterId}`;

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
            if (data.timestamp) {
                data.timestamp = new Date(data.timestamp);
            }
            return await this.feedbackModel.create(data);
        } catch (error) {
            console.error('Failed to save feedback:', error);
            throw new Error('Could not save feedback'); 
        }
    }

}

