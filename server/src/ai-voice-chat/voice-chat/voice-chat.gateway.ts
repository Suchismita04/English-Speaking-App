import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { TtsService } from '../tts/tts.service';
import { VoiceChatService } from './voice-chat.service';
// import { User } from 'src/user/entities/user.entity';

@WebSocketGateway({ cors: true })
export class VoiceChatGateway {
  constructor(
    private voiceService: VoiceChatService,
    private ttsService: TtsService,
    // private readonly user:User
  ) {}

  @SubscribeMessage('voice_chunk')
  async handleVoice(
    @MessageBody() payload: any,
    @ConnectedSocket() client: any,
  ) {
    const { audio, sessionId } = payload;
    const userId = payload.userId;
    
 // send the user voice chuncks to get the text response
    const response = await this.voiceService.handleVoiceBuffer(
      audio,
      userId,
      sessionId,
    );
    

    //for tts part
    const audioBuffer = await this.ttsService.textToSpeech(response.clearMsg);

    client.emit('voice_response', {
      audio: audioBuffer,
      sessionId: response.sessionId,
      userText: response.userText,
      aiText: response.clearMsg,
    });
  }
}
