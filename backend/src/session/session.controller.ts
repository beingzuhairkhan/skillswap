import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from 'src/auth/jwt-http.guard';
import { BookSessionDto } from './dto/book-session.dto';
import { SessionStatus } from 'src/schemas/session.schema';

@Controller('session')
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @UseGuards(JwtAuthGuard)
    @Post('book-session')
    async bookSession(@Req() req: any, @Body() bookSessionDto: BookSessionDto) {
        const userId = req.user.userId;
        return this.sessionService.createBookSession(userId, bookSessionDto)
    }

    @UseGuards(JwtAuthGuard)
    @Get('pending-session')
    async getAllBookSession(@Req() req: any) {
        const userId = req.user.userId;
        return this.sessionService.getAllPendingRequestsForMyPosts(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('accept-session')
    async acceptSession(
        @Body('sessionId') sessionId: string,
        @Body('requesterId') requesterId: string,
        @Req() req: any
    ) {
        const receiverId = req.user.userId;
        if (!sessionId || !requesterId) {
            throw new Error('Missing sessionId or requesterId');
        }
        return this.sessionService.acceptBookSession(requesterId, receiverId, sessionId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('cancel-session')
    async cancelSession(
        @Body('sessionId') sessionId: string,
        @Body('requesterId') requesterId: string,
        @Req() req: any
    ) {
        const receiverId = req.user.userId;
        if (!sessionId || !requesterId) {
            throw new Error('Missing sessionId or requesterId');
        }
        return this.sessionService.cancelBookSession(requesterId, receiverId, sessionId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('accept-session')
    async getAllAcceptSession(@Req() req: any) {
        const userId = req.user.userId;
        return this.sessionService.getAllAcceptedRequestsForMe(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-request-session')
    async getMyRequestSession(
        @Req() req: any,
        @Query('status') status: SessionStatus
    ) {
        const userId = req.user.userId;
        return this.sessionService.getMyRequestSessions(userId, status);
    }


     @UseGuards(JwtAuthGuard)
    @Get('cancel-session')
    async getAllCancelSession(@Req() req: any) {
        const userId = req.user.userId;
        return this.sessionService.getAllCanceledRequestsForMe(userId);
    }
}
