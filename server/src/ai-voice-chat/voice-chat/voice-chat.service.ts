import { Injectable } from '@nestjs/common';
import { SpeechService } from '../speech/speech.service';
import { AiService } from '../ai-service/ai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { Repository } from 'typeorm';
import { ChatSession } from '../entities/chat-session.entity';

@Injectable()
export class VoiceChatService {
  constructor(
    private speechService: SpeechService,
    private aiService: AiService,
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,

    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
  ) {}

  async handleVoice(filePath: string, sessionId: string) {
    //for stt
    const userText = await this.speechService.speechToText(filePath);
    console.log('user text:', userText); //for debug

    let session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      session = this.sessionRepo.create({
        id: sessionId, // use your hardcoded ID
      });
      await this.sessionRepo.save(session);
    }

    //save message into the db
    const userMsg = this.messageRepo.create({
      content: userText,
      role: 'user',
      session: session!,
    });

    await this.messageRepo.save(userMsg);

    const aiReply = await this.aiService.generateMessage(userText);

    console.log('ai reply:', aiReply);

    //save message into the db
    const aiMsg = this.messageRepo.create({
      content: aiReply,
      role: 'assistant',
      session: session!,
    });

    await this.messageRepo.save(aiMsg);

    return {
      userText,
      aiReply
    };
  }
}
