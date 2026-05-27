import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatMessage } from '../entities/chat-message.entity';
import { ChatSession } from '../entities/chat-session.entity';
// import { VoiceChatController } from './voice-chat.controller';
import { VoiceChatService } from './voice-chat.service';
import { AiModule } from '../ai-service/ai.module';
import { TtsService } from '../tts/tts.service';
import { VoiceChatGateway } from './voice-chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { DeepgramService } from '../speech/speech.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, ChatSession]), AiModule,AuthModule],

  // controllers: [VoiceChatController],

  providers: [VoiceChatService, DeepgramService,TtsService,VoiceChatGateway],
  exports: [TypeOrmModule, VoiceChatService],
})
export class VoiceChatModule {}
