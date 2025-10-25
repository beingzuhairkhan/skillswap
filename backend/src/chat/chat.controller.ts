import { Controller, Get, Post, Query, Req, UseGuards, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt-http.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 1️ Get all chats (for sidebar)
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAllChats(@Req() req) {
    const userId = req.user.userId;
    return this.chatService.getAllUserChats(userId);
  }

  // 2️ Get messages with a specific user
  @UseGuards(JwtAuthGuard)
  @Get('/messages')
  async getMessages(@Req() req, @Query('userId') otherUserId: string) {
    const userId = req.user.userId;
    return this.chatService.getMessagesBetweenUsers(userId, otherUserId);
  }

  // 3️ Send message
  @UseGuards(JwtAuthGuard)
  @Post('/send')
  async sendMessage(
    @Req() req,
    @Body() body: { receiverId: string; message: string },
  ) {
    const senderId = req.user.userId;
    const { receiverId, message } = body;
    return this.chatService.sendMessage(senderId, receiverId, message);
  }
}
