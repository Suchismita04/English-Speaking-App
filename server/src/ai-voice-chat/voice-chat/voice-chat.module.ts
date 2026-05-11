import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { VoiceChatController } from './voice-chat.controller';
// import { VoiceChatService } from './voice-chat.service';

import { ChatMessage } from '../entities/chat-message.entity';
import { ChatSession } from '../entities/chat-session.entity';

// import { AiModule } from '../ai-service/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatMessage,
      ChatSession,
    ]),

    // AiModule,
  ],

//   controllers: [VoiceChatController],

//   providers: [VoiceChatService],
})
export class VoiceChatModule {}