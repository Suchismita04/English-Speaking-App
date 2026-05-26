import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { TtsService } from '../tts/tts.service';
import { VoiceChatService } from './voice-chat.service';

@WebSocketGateway({ cors: true })
export class VoiceChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private voiceService: VoiceChatService,
    private ttsService: TtsService,
    private jwtService: JwtService,
  ) {}

  private audioBuffer: Record<number, Buffer[]> = {};
  private timers: Record<number, NodeJS.Timeout> = {};
  private sessionMap: Record<number, any> = {};

  // Handle connection (JWT auth)
  handleConnection(client: any) {
    const token = client.handshake.auth?.token;

    console.log('TOKEN RECEIVED:', token);
    console.log('JWT SECRET FROM ENV:', process.env.JWT_SECRET);

    if (!token) {
      console.log('No token, disconnecting...');
      client.disconnect();
      return;
    }

    try {
      const decoded = this.jwtService.verify(token);
      client.user = decoded;

      console.log('User connected:', decoded);
    } catch (err) {
      console.log('Invalid token', err);
      client.disconnect();
    }
  }

  // Receive audio chunks
  @SubscribeMessage('voice_chunk')
  async handleVoice(
    @MessageBody() payload: any,
    @ConnectedSocket() client: any,
  ) {
    const userId = client.user.sub;
    const { audio, sessionId } = payload;

    try {
      const buffer = Buffer.from(audio);

      //  store chunks
      if (!this.audioBuffer[userId]) {
        this.audioBuffer[userId] = [];
      }

      this.audioBuffer[userId].push(buffer);

      // store session
      this.sessionMap[userId] = sessionId;

      // start processing loop once
      if (!this.timers[userId]) {
        this.startProcessing(userId, client);
      }
    } catch (err) {
      console.error('Chunk processing error:', err);
    }
  }

  //Process chunks every few sec
  startProcessing(userId: number, client: any) {
    this.timers[userId] = setInterval(async () => {
      const chunks = this.audioBuffer[userId];

      if (!chunks || chunks.length === 0) return;

      // 🔥 merge chunks
      const mergedBuffer = Buffer.concat(chunks);

      // 🧹 clear buffer
      this.audioBuffer[userId] = [];

      const sessionId = this.sessionMap[userId];

      try {
        // 🎯 STT + AI
        const response = await this.voiceService.handleVoiceBuffer(
          mergedBuffer,
          userId,
          sessionId,
        );

        // 🔊 TTS
        const audioBuffer = await this.ttsService.textToSpeech(
          response.clearMsg,
        );

        // 📤 send back
        client.emit('voice_response', {
          audio: audioBuffer,
          sessionId: response.sessionId,
          userText: response.userText,
          aiText: response.clearMsg,
        });

        console.log('User:', response.userText);
        console.log('AI:', response.clearMsg);

      } catch (err: any) {
        console.error('Processing error:', err.message);
      }
    }, 3000); // ⏱️ 3 sec batching
  }


  handleDisconnect(client: any) {
    const userId = client.user?.sub;

    if (!userId) return;

    if (this.timers[userId]) {
      clearInterval(this.timers[userId]);
      delete this.timers[userId];
    }

    delete this.audioBuffer[userId];
    delete this.sessionMap[userId];

    console.log('User disconnected:', userId);
  }
}