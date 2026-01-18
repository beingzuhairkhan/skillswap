import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { 
 origin: ['https://skillswap-gilt.vercel.app', 'https://skillswap-upmw.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
  },
})
export class RoomGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private clientRooms = new Map<string, string>();

  onModuleInit() {
    console.log('[RoomGateway] WebSocket initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  @SubscribeMessage('join-room')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    // Leave previous room if exists
    const oldRoom = this.clientRooms.get(client.id);
    if (oldRoom) {
      client.leave(oldRoom);
      this.clientRooms.delete(client.id);
    }

    const room = this.server.sockets.adapter.rooms.get(roomId);
    const userCount = room ? room.size : 0;

    if (userCount >= 4) {
      client.emit('room-full');
      return;
    }

    client.join(roomId);
    this.clientRooms.set(client.id, roomId);

    console.log(`Client ${client.id} joined room ${roomId}`);

    client.to(roomId).emit('user-joined', {
      userId: client.id,
    });
  }


  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; offer: any },
  ) {
    client.to(data.roomId).emit('offer', data.offer);
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answer: any },
  ) {
    client.to(data.roomId).emit('answer', data.answer);
  }


  @SubscribeMessage('ice-candidate')
  handleIce(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; candidate: any },
  ) {
    client.to(data.roomId).emit('ice-candidate', data.candidate);
  }


  @SubscribeMessage('toggle-mic')
  handleMic(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; enabled: boolean },
  ) {
    client.to(data.roomId).emit('toggle-mic', {
      userId: client.id,
      enabled: data.enabled,
    });
  }

  @SubscribeMessage('toggle-camera')
  handleCamera(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; enabled: boolean },
  ) {
    client.to(data.roomId).emit('toggle-camera', {
      userId: client.id,
      enabled: data.enabled,
    });
  }


  handleDisconnect(client: Socket) {
    const roomId = this.clientRooms.get(client.id);

    if (roomId) {
      client.leave(roomId);
      this.clientRooms.delete(client.id);

      this.server.to(roomId).emit('user-left', {
        userId: client.id,
      });

      console.log(`Client ${client.id} left room ${roomId}`);
    }
  }

  @SubscribeMessage('chat-message')
  async handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      message: string;
      isAI?: boolean;
    }
  ) {
    this.server.to(data.roomId).emit('chat-message', {
      senderId: client.id,
      message: data.message,
      time: Date.now(),
    });

    if (data.isAI && data.message.startsWith('@')) {
      const aiPrompt = data.message.replace('@', '').trim();
      const aiResponse = await this.getAIResponse(aiPrompt);

      this.server.to(data.roomId).emit('chat-message', {
        senderId: 'AI',
        message: aiResponse,
        time: Date.now(),
        isAI: true,
      });
    }
  }


  async getAIResponse(prompt: string): Promise<string> {
    return `🤖 AI says: You asked "${prompt}"`;
  }
}