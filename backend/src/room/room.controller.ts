import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from 'src/auth/jwt-http.guard';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @UseGuards(JwtAuthGuard)
    @Post('decode')
    async decodeMeetLink(@Body('meetLink') meetLink: string, @Req() req) {
        const userId = req.user.userId;
        return this.roomService.decodeMeetLink(meetLink, userId);
    }
}
