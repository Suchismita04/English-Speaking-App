import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { TtsService } from '../tts/tts.service';
import { VoiceChatService } from './voice-chat.service';

@WebSocketGateway({ cors: true })
export class VoiceChatGateway implements OnGatewayConnection {
  constructor(
    private voiceService: VoiceChatService,
    private ttsService: TtsService,
    private jwtService: JwtService,
  ) {}

  //to get the auth data 
  handleConnection(client: any) {
    const token = client.handshake.auth?.token;
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
      console.log('Invalid token');
      client.disconnect();
    }
  }

  //main voice connection
  @SubscribeMessage('voice_chunk')
  async handleVoice(
    @MessageBody() payload: any,
    @ConnectedSocket() client: any,
  ) {
    const userId = client.user.id;

    const { audio, sessionId } = payload;

    const response = await this.voiceService.handleVoiceBuffer(
      audio,
      userId,
      sessionId,
    );

    const audioBuffer = await this.ttsService.textToSpeech(response.clearMsg);

    client.emit('voice_response', {
      audio: audioBuffer,
      sessionId: response.sessionId,
      userText: response.userText,
      aiText: response.clearMsg,
    });
  }
}
