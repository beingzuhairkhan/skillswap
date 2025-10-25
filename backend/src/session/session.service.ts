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

@Injectable()
export class SessionService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
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

      // Find the post
      const post = await this.postModel.findById(bookSessionDto.receiverId).select('_id user');
      if (!post) throw new NotFoundException('Post not found');

      if (userId === post.user.toString())
        throw new BadRequestException('Cannot book your own session');

      // Create the session
      const newSession = new this.sessionModel({
        requesterId: user._id,
        receiverId: post.user,
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

      // Ensure Chat exists between users (using messages array schema)
      const senderId = new Types.ObjectId(userId);
      const receiverId = new Types.ObjectId(post.user);

      let chat = await this.chatModel.findOne({
        $or: [
          { user1: senderId, user2: receiverId },
          { user1: receiverId, user2: senderId },
        ],
      });

      if (!chat) {
        chat = new this.chatModel({
          user1: senderId,
          user2: receiverId,
          messages: [],
        });
        await chat.save();
        console.log('New chat created:', chat._id);
      } else {
        console.log('Chat already exists:', chat._id);
      }

      return savedSession;
    } catch (error) {
      console.error('Error in createBookSession:', error);
      throw new InternalServerErrorException(error.message || 'Failed to book session');
    }
  }

  async getAllPendingRequestsForMyPosts(userId: string): Promise<any[]> {
    try {
      if (!userId) throw new NotFoundException('User not found');

      // Fetch all posts by this user
      const userPosts = await this.postModel.find({ user: userId }).select('_id') as { _id: Types.ObjectId }[];

      if (!userPosts || userPosts.length === 0) {
        // User has no posts, so no sessions
        return [];
      }

      const postIds = userPosts.map((post) => post._id.toString());

      // Fetch pending sessions for these posts
      const sessions = await this.sessionModel
        .find({
          postId: { $in: postIds },
          status: SessionStatus.PENDING,
        })
        .populate({
          path: 'requesterId',
          select: '_id name imageUrl collegeName bio domain', // don't include password
        })
        .populate({
          path: 'postId',
          select: 'wantToLearn wantToTeach specificTopic postImageUrl postUrl',
        })
        .sort({ createdAt: -1 });

      // Return empty array if no sessions found
      return sessions || [];
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch session requests for your posts');
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

  async getAllAcceptedRequestsForMyPosts(userId: string): Promise<any> {
    try {
      if (!userId) throw new NotFoundException('User not found');

      const userPosts = await this.postModel
        .find({ user: userId })
        .select('_id') as { _id: mongoose.Types.ObjectId }[];

      const postIds = userPosts.map((post) => post._id.toString());

      if (postIds.length === 0) {
        return []; // No posts = no sessions
      }

      const sessions = await this.sessionModel
        .find({
          postId: { $in: postIds },
          status: SessionStatus.ACCEPT,
        })
        .populate({
          path: 'requesterId',
          select: '_id name imageUrl collegeName domain -password', // bio removed
        })
        .populate({
          path: 'postId',
          select: 'wantToLearn  specificTopic ',
        })
        .select('-studentNotes') // remove studentNotes from session
        .sort({ createdAt: -1 });

      if (!sessions || sessions.length === 0) {
        throw new NotFoundException('No accepted session requests for your posts');
      }

      return sessions;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch accepted session requests for your posts');
    }
  }






}
