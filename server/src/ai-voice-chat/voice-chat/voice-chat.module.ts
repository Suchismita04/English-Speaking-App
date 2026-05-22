import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatMessage } from '../entities/chat-message.entity';
import { ChatSession } from '../entities/chat-session.entity';
// import { VoiceChatController } from './voice-chat.controller';
import { VoiceChatService } from './voice-chat.service';
import { AiModule } from '../ai-service/ai.module';
import { SpeechService } from '../speech/speech.service';
import { TtsService } from '../tts/tts.service';
import { VoiceChatGateway } from './voice-chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, ChatSession]), AiModule],

  // controllers: [VoiceChatController],

  providers: [VoiceChatService, SpeechService,TtsService,VoiceChatGateway],
  exports: [TypeOrmModule, VoiceChatService],
})
export class VoiceChatModule {}
