import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from 'src/auth/jwt-http.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }

  @Post('audioSummary')
  @UseInterceptors(FileInterceptor('file'))
  async speechToText(
    @UploadedFile() file: Express.Multer.File,
    @Body('roomId') roomId: string,
    @Body('speakerId') speakerId: string,
    @Body('speakerRole') speakerRole: string,
  ) {
    // if (!file) {
    //   throw new NotFoundException('No audio file uploaded');
    // }

    // if (!roomId || !speakerId || !speakerRole) {
    //   throw new NotFoundException('Missing required metadata');
    // }

    console.log("data from frontend", file, roomId, speakerId, speakerRole)

    try {
      const transcription = await this.roomService.convertAudioToText(file, roomId, speakerId, speakerRole);
      return {
        text: transcription,
        roomId,
        speakerId,
        speakerRole,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to convert audio to text',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('decode')
  async decodeMeetLink(@Body('meetLink') meetLink: string, @Req() req) {
    const userId = req.user.userId;
    return this.roomService.decodeMeetLink(meetLink, userId);
  }

  @Post('decodeRoom')
  async decodeMeetLinkFromRoom(@Body('meetLink') meetLink: string) {
    return this.roomService.decodeMeetLinkFromRoom(meetLink);
  }

  @Post('feedback')
  async createFeedback(@Body() body: any) {
    return this.roomService.saveFeedback(body)
  }

  @UseGuards(JwtAuthGuard)
  @Get('myReview')
  async getAllMyReviews(@Req() req) {
    const userId = req.user.userId;
    return this.roomService.getUserReviews(userId)

  }

}
