import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { TtsService } from '../tts/tts.service';
import { VoiceChatService } from './voice-chat.service';
import { DeepgramService } from '../speech/speech.service';
import { cleanTextForSpeech } from 'src/utilities/cleanTextForSpeech';

@WebSocketGateway({ cors: true })
export class VoiceChatGateway {
  constructor(
    private voiceService: VoiceChatService,
    private ttsService: TtsService,
    private jwtService: JwtService,
    private dgService: DeepgramService,
  ) {}

  handleConnection(client: any) {
    const token = client.handshake.auth?.token;

    if (!token) return client.disconnect();

    try {
      const decoded = this.jwtService.verify(token);
      client.user = decoded;
      console.log('User connected:', decoded);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('voice_stream')
  handleStream(@MessageBody() audio: number[], @ConnectedSocket() client: any) {
    console.log('Chunk received:', audio.length);

    const userId = client.user.sub;

    const buffer = Buffer.from(new Int16Array(audio).buffer);

    // create connection once
    if (!this.dgService.connections[userId]) {
      this.dgService.createConnection(userId, async (text) => {
        console.log('FINAL TEXT:', text);

        const response = await this.voiceService.generateReply(text, userId);
        const clearMsg= cleanTextForSpeech(response.aiReply)

        const audio = await this.ttsService.textToSpeech(clearMsg);

        client.emit('voice_response', {
          sessionId: response.sessionId,
          aiText: response.aiReply,
          audio,
        });
      });
    }

    this.dgService.sendAudio(userId, buffer);
  }

  handleDisconnect(client: any) {
    const userId = client.user?.sub;

    if (!userId) return;

    this.dgService.close(userId);

    console.log('User disconnected:', userId);
  }
}
