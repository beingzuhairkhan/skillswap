import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import Groq from "groq-sdk";
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: ['https://skillswap-gilt.vercel.app', 'https://skillswap-upmw.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
  },
})

export class RoomGateway implements OnModuleInit {
  private groq: Groq;
  @WebSocketServer()
  server: Server;

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

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

    if (!data.isAI) return;

    const text = data.message.trim();
    let aiResponse:any ;

    // TEXT AI (@)
    if (text.startsWith('@')) {
      const prompt = text.slice(1).trim();
      if (!prompt) return;

      aiResponse = await this.getAIResponse(prompt);
    }

    // IMAGE AI (#)
    else if (text.startsWith('#')) {
      const prompt = text.slice(1).trim();
      if (!prompt) return;

      aiResponse = await this.getAIImageResponse(prompt);
    }

    else {
      return;
    }

    // Send AI response
    this.server.to(data.roomId).emit('chat-message', {
      senderId: 'AI',
      message: aiResponse,
      time: Date.now(),
      isAI: true,
    });

  }


  async getAIResponse(prompt: string): Promise<string> {
    return this.getChatCompletion(prompt)
  }

  async getChatCompletion(prompt: string): Promise<string> {
    const completion = await this.groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Answer in one or two short sentences only, concisely, and remove markdown symbols.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    let response = completion.choices[0]?.message?.content ?? '';

    response = response.replace(/[#\-\*\>`_~]/g, '').trim();
    return response;
  }


async getAIImageResponse(prompt: string): Promise<string> {
  if (!prompt) {
    console.error("No prompt provided");
    throw new Error("Prompt is required");
  }

  try {
    const url = process.env.REQUEST_URL!;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AI API request failed: ${response.status} - ${text}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataURI = `data:image/jpeg;base64,${base64}`;
    return dataURI;

  } catch (err: any) {
    console.error("Failed to generate image:", err.message);
    throw new Error("Image generation failed");
  }
}



}