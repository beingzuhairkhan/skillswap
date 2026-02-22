import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import Groq from 'groq-sdk';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
@WebSocketGateway({
  cors: {
    origin: [
      'https://skillswap-iota-three.vercel.app',
      'https://skillswap-upmw.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
  },
})
export class RoomGateway implements OnModuleInit {
  private groq: Groq;
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  private clientRooms = new Map<string, string>();

  onModuleInit() {
    console.log('[RoomGateway] WebSocket initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userModel.findByIdAndUpdate(userId, { isOnline: true }).exec();
      this.server.emit('update-user-status', { userId, isOnline: true });
    }
  }

  @SubscribeMessage('join-room')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
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

  @SubscribeMessage('draw')
  handleDraw(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    client.broadcast.emit('draw', data);
  }

  @SubscribeMessage('shape')
  handleShape(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    client.broadcast.emit('shape', data);
  }

  @SubscribeMessage('clear')
  handleClear(@ConnectedSocket() client: Socket) {
    this.server.emit('clear');
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
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userModel.findByIdAndUpdate(userId, { isOnline: false }).exec();
      this.server.emit('update-user-status', { userId, isOnline: false });
    }

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
    },
  ) {
    this.server.to(data.roomId).emit('chat-message', {
      senderId: client.id,
      message: data.message,
      time: Date.now(),
    });

    if (!data.isAI) return;

    const text = data.message.trim();
    let aiResponse: any;

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
    } else {
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
    return this.getChatCompletion(prompt);
  }

  async getChatCompletion(prompt: string): Promise<string> {
    const completion = await this.groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Answer in one or two short sentences only, concisely, and remove markdown symbols.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    let response = completion.choices[0]?.message?.content ?? '';

    response = response.replace(/[#\-\*\>`_~]/g, '').trim();
    return response;
  }

  async getAIImageResponse(prompt: string): Promise<string> {
    if (!prompt) {
      console.error('No prompt provided');
      throw new Error('Prompt is required');
    }

    try {
      const url = process.env.REQUEST_URL!;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`AI API request failed: ${response.status} - ${text}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataURI = `data:image/jpeg;base64,${base64}`;
      return dataURI;
    } catch (err: any) {
      console.error('Failed to generate image:', err.message);
      throw new Error('Image generation failed');
    }
  }

  async transcribeGenerate(file: any): Promise<any> {
    try {
      console.log('filepath from trans', file);
      const language = 'hi';
      const audioFile = new File(
        [file.buffer],
        file.originalname || 'audio.webm',
        {
          type: file.mimetype || 'audio/webm',
          lastModified: Date.now(),
        },
      );
      const transcription = await this.groq.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3-turbo',
        prompt: `
              Transcribe this audio accurately into Hindi text.
              - Preserve the speaker’s exact words
              - Add proper punctuation
              - Do not summarize or paraphrase
              - Ignore background noise and filler sounds
              - If a word is unclear, mark it as [inaudible]
               `,
        response_format: 'verbose_json',
        timestamp_granularities: ['word', 'segment'],
        language: language || 'en',
        temperature: 0.0,
      });
      console.log('res from tran', transcription);
      return transcription;
    } catch (error) {
      throw new Error(error.message || 'Transcription failed');
    }
  }

  async transcribeSummarize(transcription: string): Promise<string> {
    try {
      console.log('filepath from transcription', transcription);
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that summarizes meeting conversations per speaker. 
           The conversation is only ever in Hindi or English. 
           Ignore any other languages or characters. 
           Your task is:
           1. Understand the meaning of what each speaker says.
           2. Convert all speech into English, preserving the meaning (not word-for-word translation).
           3. Summarize the discussion per speaker.
           4. Include only the important points discussed by each participant.
           Output format examplimport { InjectModel } from '@nestjs/mongoose';
e:

           Speaker 1:
           - Key point 1
           - Key point 2

           Speaker 2:
           - Key point 1
           - Key point 2`,
          },
          {
            role: 'user',
            content: `Summarize the following transcript in a concise way:\n\n${transcription}`,
          },
        ],
      });

      console.log(
        'res from transcription',
        completion.choices?.[0]?.message?.content,
      );

      return completion.choices?.[0]?.message?.content || '';
    } catch (error: any) {
      throw new Error(error.message || 'Summary generation failed');
    }
  }
}

// ata from frontend {
//   fieldname: 'file',
//   originalname: 'audio.webm',
//   encoding: '7bit',
//   mimetype: 'audio/webm',
//   buffer: <Buffer 1a 45 df a3 9f 42 86 81 01 42 f7 81 01 42 f2 81 04 42 f3 81 08 42 82 84 77 65 62 6d 42 87 81 04 42 85 81 02 18 53 80 67 01 00 00 00 00 00 57 06 11 4d ... 22276 more bytes>,
//   size: 22326
// } 68f612b1ad916a584418a416-68f627aa750890ee59b36b1e 68f612b1ad916a584418a416 UserA
// filepath from trans {
//   fieldname: 'file',
//   originalname: 'audio.webm',
//   encoding: '7bit',
//   mimetype: 'audio/webm',
//   buffer: <Buffer 1a 45 df a3 9f 42 86 81 01 42 f7 81 01 42 f2 81 04 42 f3 81 08 42 82 84 77 65 62 6d 42 87 81 04 42 85 81 02 18 53 80 67 01 00 00 00 00 00 57 06 11 4d ... 22276 more bytes>,
//   size: 22326
// }
// data from frontend {
//   fieldname: 'file',
//   originalname: 'audio.webm',
//   encoding: '7bit',
//   mimetype: 'audio/webm',
//   buffer: <Buffer 1a 45 df a3 9f 42 86 81 01 42 f7 81 01 42 f2 81 04 42 f3 81 08 42 82 84 77 65 62 6d 42 87 81 04 42 85 81 02 18 53 80 67 01 00 00 00 00 00 56 fd 11 4d ... 22267 more bytes>,
//   size: 22317
// } 68f612b1ad916a584418a416-68f627aa750890ee59b36b1e 68f612b1ad916a584418a416 UserA
// filepath from trans {
//   fieldname: 'file',
//   originalname: 'audio.webm',
//   encoding: '7bit',
//   mimetype: 'audio/webm',
//   buffer: <Buffer 1a 45 df a3 9f 42 86 81 01 42 f7 81 01 42 f2 81 04 42 f3 81 08 42 82 84 77 65 62 6d 42 87 81 04 42 85 81 02 18 53 80 67 01 00 00 00 00 00 56 fd 11 4d ... 22267 more bytes>,
//   size: 22317
// }
// res from tran {
//   task: 'transcribe',
//   language: 'Hindi',
//   duration: 7.98,
//   text: ' K Украї� Sportsgoились. crossedQUE',
//   words: [ { word: 'K', start: 1.82, end: 1.84 } ],
//   segments: [
//     {
//       id: 0,
//       seek: 0,
//       start: 0,
//       end: 1.34,
//       text: ' K Украї� Sportsgoились.',
//       tokens: [Array],
//       temperature: 1,
//       avg_logprob: -5.750283,
//       compression_ratio: 0.8804348,
//       no_speech_prob: 4.4881446e-10
//     },
//     {
//       id: 1,
//       seek: 134,
//       start: 1.34,
//       end: 7.98,
//       text: ' crossedQUE',
//       tokens: [Array],
//       temperature: 1,
//       avg_logprob: -5.5484514,
//       compression_ratio: 0.5555556,
//       no_speech_prob: 3.7541384e-10
//     }
//   ],
//   x_groq: { id: 'req_01kfas7wcxew1vn9a5gyp42g6b' }
// }
// filepath from transcription  K Украї� Sportsgoились. crossedQUE
// res from tran {
//   task: 'transcribe',
//   language: 'Hindi',
//   duration: 7.98,
//   text: ' Hello, I am currently taking computer to N IC, Mr XVNI .',
//   words: [
//     { word: 'Hello,', start: 1.94, end: 2.4 },
//     { word: 'I', start: 2.4, end: 2.6 },
//     { word: 'am', start: 2.6, end: 2.64 },
//     { word: 'currently', start: 2.64, end: 3.76 },
//     { word: 'taking', start: 3.76, end: 4.88 },
//     { word: 'computer', start: 4.88, end: 5.52 },
//     { word: 'to', start: 5.52, end: 5.82 },
//     { word: 'N', start: 5.82, end: 6.3 },
//     { word: 'IC,', start: 6.3, end: 6.32 },
//     { word: 'Mr', start: 6.32, end: 6.68 },
//     { word: 'XVNI .', start: 6.68, end: 7.2 }
//   ],
//   segments: [
//     {
//       id: 0,
//       seek: 0,
//       start: 0,
//       end: 8,
//       text: ' Hello, I am currently taking computer to N IC, Mr XVNI .',
//       tokens: [Array],
//       temperature: 1,
//       avg_logprob: -3.5246632,
//       compression_ratio: 0.875,
//       no_speech_prob: 5.652086e-10
//     }
//   ],
//   x_groq: { id: 'req_01kfas7wj0ejvtv5hr33esc71c' }
// }
// filepath from transcription  Hello, I am currently taking computer to N IC, Mr XVNI .
// res from transcription It appears there is no transcript to summarize. The provided text seems to be incomplete or contains characters that are not recognizable. Please provide a complete and legible transcript of the meeting conversation, and I'll be happy to summarize it for you.
// final  {
//   roomId: '68f612b1ad916a584418a416-68f627aa750890ee59b36b1e',
//   speakerId: '68f612b1ad916a584418a416',
//   speakerRole: 'UserA',
//   language: 'hi',
//   audioFilePath: 'audio.webm',
//   transcription: ' K Украї� Sportsgoились. crossedQUE',
//   summary: "It appears there is no transcript to summarize. The provided text seems to be incomplete or contains characters that are not recognizable. Please provide a complete and legible transcript of the meeting conversation, and I'll be happy to summarize it for you.",
//   _id: new ObjectId('696df8d08a2d363c63457b81'),
//   segments: [],
//   createdAt: 2026-01-19T09:26:40.618Z,
//   updatedAt: 2026-01-19T09:26:40.618Z,
//   __v: 0
// }
// res from transcription Here is a concise summary of the transcript per speaker:

// * Speaker: Introduced themselves and mentioned they are currently taking a computer to N IC, addressed Mr. XVNI.
// final  {
//   roomId: '68f612b1ad916a584418a416-68f627aa750890ee59b36b1e',
//   speakerId: '68f612b1ad916a584418a416',
//   speakerRole: 'UserA',
//   language: 'hi',
//   audioFilePath: 'audio.webm',
//   transcription: ' Hello, I am currently taking computer to N IC, Mr XVNI .',
//   summary: 'Here is a concise summary of the transcript per speaker:\n' +
//     '\n' +
//     '* Speaker: Introduced themselves and mentioned they are currently taking a computer to N IC, addressed Mr. XVNI.',
//   _id: new ObjectId('696df8d08a2d363c63457b83'),
//   segments: [],
//   createdAt: 2026-01-19T09:26:40.929Z,
//   updatedAt: 2026-01-19T09:26:40.929Z,
//   __v: 0
// }
// ^C
// PS D:\zuhair\project4\newss\skillswap\backend> ^C
// PS D:\zuhair\project4\newss\skillswap\backend>
