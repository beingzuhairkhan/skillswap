import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument, ChatMessage } from 'src/schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>) {}

  // Fetch all chats for a user (return latest message per chat)
  async getAllUserChats(userId: string): Promise<any> {
    try {
      if (!userId) {
        throw new InternalServerErrorException('User ID is required');
      }

      const objectUserId = new Types.ObjectId(userId);

      // Find all chats where user is a participant
      const chats = await this.chatModel
        .find({
          $or: [
            { user1: objectUserId },
            { user2: objectUserId },
          ],
        })
        .populate('user1', 'name imageUrl collegeName domain -password')
        .populate('user2', 'name imageUrl collegeName domain -password')
        .sort({ updatedAt: -1 }); // latest chat first

      // Map to include "other user" and last message
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

  // Send a message (push to messages array)
  async sendMessage(senderId: string, receiverId: string, message: string): Promise<any> {
    try {
      const senderObjectId = new Types.ObjectId(senderId);
      const receiverObjectId = new Types.ObjectId(receiverId);

      // Find existing chat between two users
      let chat = await this.chatModel.findOne({
        $or: [
          { user1: senderObjectId, user2: receiverObjectId },
          { user1: receiverObjectId, user2: senderObjectId },
        ],
      });

      const newMessage: Partial<ChatMessage> = {
        sender: senderObjectId,
        message,
        sentAt: new Date(),
        read: false,
      };

      if (chat) {
        // Push message into existing chat
        chat.messages.push(newMessage as ChatMessage);
        await chat.save();
      } else {
        // Create new chat
        chat = new this.chatModel({
          user1: senderObjectId,
          user2: receiverObjectId,
          messages: [newMessage],
        });
        await chat.save();
      }
      //console.log("s" , chat)

      return chat;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new InternalServerErrorException('Failed to send message');
    }
  }

  // Fetch all messages between two users
 async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<ChatMessage[]> {
  try {
    const chat = await this.chatModel.findOne({
      $or: [
        { user1: new Types.ObjectId(userId1), user2: new Types.ObjectId(userId2) },
        { user1: new Types.ObjectId(userId2), user2: new Types.ObjectId(userId1) },
      ],
    });

  //  console.log("chatmessage" , chat?.messages)

    return chat?.messages || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new InternalServerErrorException('Failed to fetch messages');
  }
}
}
