import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { Session, SessionDocument, SessionStatus } from 'src/schemas/session.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UploadService } from 'src/upload/upload.service';
import { BookSessionDto } from './dto/book-session.dto';
import { JwtService } from '@nestjs/jwt';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { EVENTS } from '../notification/eventTypes'
import eventBus from 'src/notification/eventBus';
import { Feedback, FeedbackDocument } from 'src/schemas/feedback.schema';

@Injectable()
export class SessionService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    @InjectModel(Feedback.name) private readonly feedbackModel: Model<FeedbackDocument>,
    private readonly cloudinary: UploadService,
    private jwtService: JwtService
  ) { }


  generateMeetToken(receiverId: string, requesterId: string): string {
    if (!receiverId || !requesterId) throw new Error('Missing IDs');
    const payload = {
      receiverId, requesterId
    }
    const meetToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '90d',
    })

    return meetToken

  }


  async createBookSession(
    userId: string,
    bookSessionDto: BookSessionDto
  ): Promise<SessionDocument> {
    try {
      if (!userId) throw new NotFoundException('User not found');

      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      const post = await this.postModel.findById(bookSessionDto.receiverId).select('_id user');
      if (!post) throw new NotFoundException('Post not found');

      if (userId === post.user.toString())
        throw new BadRequestException('Cannot book your own session');

      const newSession = new this.sessionModel({
        requesterId: user._id,
        receiverId: new Types.ObjectId(post.user),
        postId: post._id,
        sessionType: bookSessionDto.sessionType,
        durationTime: bookSessionDto.durationTime,
        date: bookSessionDto.date,
        time: bookSessionDto.time,
        studentNotes: bookSessionDto.studentNotes,
        status: SessionStatus.PENDING,
        isCompleted: false,
      });

      const savedSession = await newSession.save();
      console.log("event bus hitting")

      eventBus.emit(EVENTS.SESSION_CREATED, {
        sessionId: savedSession._id,
        requesterId: savedSession.requesterId,
        receiverId: savedSession.receiverId,
        postId: savedSession.postId,
        date: savedSession.date,
        time: savedSession.time,
        sessionData: savedSession
      })

      return savedSession;
    } catch (error) {
      console.error('Error in createBookSession:', error);
      throw new InternalServerErrorException(error.message || 'Failed to book session');
    }
  }

  async getAllPendingRequestsForMyPosts(userId: string): Promise<any[]> {
    try {
      if (!userId) throw new NotFoundException('User not found');

      // Fetch pending sessions where this user is the receiver
      const sessions = await this.sessionModel
        .find({
          receiverId: new Types.ObjectId(userId), // filter by receiver
          status: SessionStatus.PENDING,
        })
        .populate({
          path: 'requesterId', // get info about who requested
          select: '_id name imageUrl collegeName bio domain', // exclude sensitive info
        })
        .populate({
          path: 'postId', // get info about the post
          select: 'wantToLearn wantToTeach specificTopic postImageUrl postUrl',
        })
        .sort({ createdAt: -1 });

      return sessions || [];
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch pending requests for your posts');
    }
  }


  async acceptBookSession(requesterId: string, receiverId: string, sessionId: string): Promise<any> {
    try {
      if (!requesterId || !receiverId || !sessionId) {
        throw new NotFoundException('Missing requesterId, receiverId, or sessionId');
      }

      if (requesterId === receiverId) {
        throw new UnauthorizedException('You are not authorized to accept this session');
      }

      const session = await this.sessionModel.findById(sessionId);

      if (!session) {
        throw new NotFoundException('Booked session not found');
      }

      if (session.receiverId.toString() !== receiverId) {
        throw new UnauthorizedException('You are not authorized to accept this session');
      }

      if (session.status !== SessionStatus.PENDING) {
        throw new Error('Session is not in a pending state');
      }
      const token = this.generateMeetToken(receiverId, requesterId);
      if (!token) {
        throw new Error('Token is required ');
      }
      const meetLink = `http://localhost:skillswap/meet/${token}`;
      session.status = SessionStatus.ACCEPT;
      session.googleMeetLink = meetLink;
      await session.save();
      return {
        message: 'Session accepted successfully',
        meetLink,
        session,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to accept booked sessions');
    }
  }

  async getAllAcceptedRequestsForMe(userId: string): Promise<any[]> {
    try {
      if (!userId) throw new NotFoundException('User not found');

      const sessions = await this.sessionModel
        .find({
          receiverId: new Types.ObjectId(userId),
          status: SessionStatus.ACCEPT,
        })
        .populate({
          path: 'requesterId',
          select: '_id name imageUrl collegeName domain -password',
        })
        .populate({
          path: 'postId',
          select: 'wantToLearn specificTopic',
        })
        .select('-studentNotes') // optional
        .sort({ createdAt: -1 });

      return sessions || [];
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to fetch accepted session requests'
      );
    }
  }

  async getAllCompletedSessions(userId: string): Promise<any[]> {
    try {
      if (!userId) throw new NotFoundException('User not found');

      const sessions = await this.sessionModel
        .find({
          receiverId: new Types.ObjectId(userId),
          status: SessionStatus.COMPLETE,
        })
        .populate({
          path: 'requesterId',
          select: '_id name imageUrl collegeName domain -password',
        })
        .populate({
          path: 'postId',
          select: 'wantToLearn specificTopic',
        })
        .select('-studentNotes') 
        .sort({ createdAt: -1 });

      return sessions || [];
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to fetch accepted session requests'
      );
    }
  }

  async getMyRequestSessions(userId: string, status: SessionStatus) {
    try {
      const sessionData = await this.sessionModel.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                {
                  $or: [
                    { $eq: ["$requesterId", userId] },
                    { $eq: ["$requesterId", { $toObjectId: userId }] }
                  ]
                },
                { $eq: ["$status", status] }
              ]
            }
          }

        },

        // Requester
        {
          $lookup: {
            from: "users",
            let: { requesterIdObj: { $toObjectId: "$requesterId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$requesterIdObj"] } } },
              { $project: { _id: 1, name: 1, imageUrl: 1 } },
            ],
            as: "requester",
          },
        },
        { $unwind: { path: "$requester", preserveNullAndEmptyArrays: true } },

        // Receiver
        {
          $lookup: {
            from: "users",
            let: { receiverIdObj: { $toObjectId: "$receiverId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$receiverIdObj"] } } },
              { $project: { _id: 1, name: 1, imageUrl: 1 } },
            ],
            as: "receiver",
          },
        },
        { $unwind: { path: "$receiver", preserveNullAndEmptyArrays: true } },

        // Post
        {
          $lookup: {
            from: "posts",
            let: { postIdObj: { $toObjectId: "$postId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$postIdObj"] } } },
              { $project: { wantToLearn: 1, wantToTeach: 1, specificTopic: 1, postImageUrl: 1, postUrl: 1 } },
            ],
            as: "post",
          },
        },
        { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },

        // Project
        {
          $project: {
            _id: 1,
            sessionType: 1,
            durationTime: 1,
            date: 1,
            time: 1,
            studentNotes: 1,
            status: 1,
            isCompleted: 1,
            googleMeetLink: 1,
            createdAt: 1,
            "requester._id": 1,
            "requester.name": 1,
            "requester.imageUrl": 1,
            "receiver._id": 1,
            "receiver.name": 1,
            "receiver.imageUrl": 1,
            "post.wantToLearn": 1,
            "post.wantToTeach": 1,
            "post.specificTopic": 1,
            "post.postImageUrl": 1,
            "post.postUrl": 1,
          },
        },

        { $sort: { createdAt: -1 } },
      ]);



      return sessionData;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        "Failed to fetch session requests"
      );
    }
  }

  async cancelBookSession(requesterId: string, receiverId: string, sessionId: string): Promise<any> {
    try {
      if (!requesterId || !receiverId || !sessionId) {
        throw new NotFoundException('Missing requesterId, receiverId, or sessionId');
      }

      if (requesterId === receiverId) {
        throw new UnauthorizedException('You are not authorized to accept this session');
      }

      const session = await this.sessionModel.findById(sessionId);

      if (!session) {
        throw new NotFoundException('Booked session not found');
      }

      if (session.receiverId.toString() !== receiverId) {
        throw new UnauthorizedException('You are not authorized to accept this session');
      }

      if (session.status !== SessionStatus.PENDING) {
        throw new Error('Session is not in a pending state');
      }
      session.status = SessionStatus.REJECT;
      await session.save();
      return {
        message: 'Session Cancel successfully',
        session,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to accept booked sessions');
    }
  }

  async getAllCanceledRequestsForMe(userId: string): Promise<any[]> {
    try {
      if (!userId) throw new NotFoundException('User not found');

      const sessions = await this.sessionModel
        .find({
          receiverId: new Types.ObjectId(userId),
          status: SessionStatus.REJECT,
        })
        .populate({
          path: 'requesterId',
          select: '_id name imageUrl collegeName domain -password',
        })
        .populate({
          path: 'postId',
          select: 'wantToLearn specificTopic',
        })
        .select('-studentNotes') // optional
        .sort({ createdAt: -1 });

      return sessions || [];
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to fetch accepted session requests'
      );
    }
  }



}
