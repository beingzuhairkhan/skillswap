import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument, ChatMessage } from 'src/schemas/chat.schema';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) { }

  async getAllUserChats(userId: string): Promise<any> {
    try {
      if (!userId) {
        throw new InternalServerErrorException('User ID is required');
      }

      const objectUserId = new Types.ObjectId(userId);

      const chats = await this.chatModel
        .find({
          $or: [
            { user1: objectUserId },
            { user2: objectUserId },
          ],
        })
        .populate('user1', 'name imageUrl collegeName domain -password isOnline')
        .populate('user2', 'name imageUrl collegeName domain -password isOnline')
        .sort({ updatedAt: -1 });

      const formattedChats = chats.map(chat => {
        const otherUser = chat.user1._id.equals(objectUserId) ? chat.user2 : chat.user1;
        const lastMessage = chat.messages[chat.messages.length - 1] || null;
        return {
          chatId: chat._id,
          user: otherUser,
          lastMessage: lastMessage?.message || '',
          lastMessageAt: lastMessage?.sentAt || (chat as any).updatedAt || null,
        };
      });

      return formattedChats;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw new InternalServerErrorException(error.message || 'Failed to fetch chats');
    }
  }

  async sendMessage(senderId: string, receiverId: string, message: string) {
    if (!message?.trim()) {
      throw new InternalServerErrorException('Message cannot be empty');
    }

    if (senderId === receiverId) {
      throw new InternalServerErrorException('Cannot message yourself');
    }

    const sender = new Types.ObjectId(senderId);
    const receiver = new Types.ObjectId(receiverId);

    const newMessage: ChatMessage = {
      sender,
      message,
      sentAt: new Date(),
      read: false,
    };

    const chat = await this.chatModel.findOneAndUpdate(
      {
        $or: [
          { user1: sender, user2: receiver },
          { user1: receiver, user2: sender },
        ],
      },
      {
        $setOnInsert: { user1: sender, user2: receiver },
        $push: { messages: newMessage },
      },
      { upsert: true, new: true }
    );

    return chat;
  }


  async getMessagesBetweenUsers(userId1: string, userId2: string) {
    try {

      const findUser = await this.userModel.findById(userId2).select('name domain imageUrl');
      if (!findUser) {
        throw new InternalServerErrorException('User does not exist');
      }

      const chat = await this.chatModel
        .findOne({
          $or: [
            { user1: new Types.ObjectId(userId1), user2: new Types.ObjectId(userId2) },
            { user1: new Types.ObjectId(userId2), user2: new Types.ObjectId(userId1) },
          ],
        })
        .populate('messages.sender', 'name imageUrl')
        .lean();

      return {
        user: {
          _id: findUser._id,
          name: findUser.name,
          domain: findUser.domain,
          imageUrl: findUser.imageUrl,
        },
        messages: chat?.messages
          ? chat.messages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
          : [],
      };
    } catch (error) {
      console.error('Error fetching messages between users:', error);
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }


}
