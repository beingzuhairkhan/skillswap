import { Controller, Get, Post, Query, Req, UseGuards, Body, Param, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt-http.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  // 1️ Get all chats (for sidebar)
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAllChats(@Req() req) {
    const userId = req.user.userId;
    return this.chatService.getAllUserChats(userId);
  }

  // 2️ Get messages with a specific user
  @UseGuards(JwtAuthGuard)
  @Get('/messages/:userId')
  async getMessages(@Req() req, @Param('userId') otherUserId: string) {

    const userId = req.user.userId;

    if (!otherUserId) {
      throw new BadRequestException('Other user ID is required');
    }

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

  // @UseGuards(JwtAuthGuard)
  // @Get('single-message')
  // async getSingleMessage(
  //  @Req() req ,
  //  @Query() 
  // ){

  // }


}
