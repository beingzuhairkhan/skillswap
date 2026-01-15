import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: ['https://skillswap-gilt.vercel.app', 'https://skillswap-upmw.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
  },
  transports: ['websocket', 'polling'],
})
export class RoomGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    console.log('[RoomGateway] WebSocket server initialized');
  }

  private clientRooms = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  @SubscribeMessage('join-room')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {

    const oldRoom = this.clientRooms.get(client.id);
    if (oldRoom) {
      client.leave(oldRoom);
      this.clientRooms.delete(client.id);
    }


    const clients = this.server.sockets.adapter.rooms.get(roomId);
    const numClients = clients ? clients.size : 0;

    if (numClients >= 4) {
      client.emit('room-full', { message: 'This room is full. Maximum 2 participants allowed.' });
      console.log(`Client ${client.id} tried to join full room ${roomId}`);
      return;
    }

    const isInitiator = numClients === 0;

    client.join(roomId);

    this.clientRooms.set(client.id, roomId);

    const updatedClients = this.server.sockets.adapter.rooms.get(roomId);
    const userCount = updatedClients ? updatedClients.size : 1;

    client.emit('joined-room', { isInitiator, userCount });

    if (numClients > 0) {
      client.to(roomId).emit('user-joined', { userCount });
    }


    console.log(`Client ${client.id} joined room ${roomId}. Is initiator: ${isInitiator}, Total users: ${userCount}`);
  }

  @SubscribeMessage('signal')
  handleSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      signal: any;
    }
  ) {
    client.to(data.roomId).emit('signal', {
      senderId: client.id,
      signal: data.signal,
    });
  }

  @SubscribeMessage('screen-share-started')
  handleScreenShareStarted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    console.log(`Client ${client.id} started screen sharing in room ${data.roomId}`);

      this.server.to(data.roomId).emit('screen-share-started');
  }

  @SubscribeMessage('screen-share-stopped')
  handleScreenShareStopped(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    console.log(`Client ${client.id} stopped screen sharing in room ${data.roomId}`);

   this.server.to(data.roomId).emit('screen-share-stopped');
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

  @SubscribeMessage('toggle-mic')
  handleMic(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      enabled: boolean;
    }
  ) {
    client.to(data.roomId).emit('toggle-mic', {
      userId: client.id,
      enabled: data.enabled,
    });
  }

  @SubscribeMessage('toggle-camera')
  handleCamera(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      enabled: boolean;
    }
  ) {
    client.to(data.roomId).emit('toggle-camera', {
      userId: client.id,
      enabled: data.enabled,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);

    const roomId = this.clientRooms.get(client.id);

    if (roomId) {
      client.leave(roomId);

      const clients = this.server.sockets.adapter.rooms.get(roomId);
      const userCount = clients ? clients.size : 0;

      // Notify others in the room
      this.server.to(roomId).emit('user-left', {
        userId: client.id,
        userCount,
      });

      console.log(`Client ${client.id} left room ${roomId}. Remaining users: ${userCount}`);

      this.clientRooms.delete(client.id);
    }
  }

  async getAIResponse(prompt: string): Promise<string> {
    return `🤖 AI says: You asked "${prompt}"`;
  }
}
