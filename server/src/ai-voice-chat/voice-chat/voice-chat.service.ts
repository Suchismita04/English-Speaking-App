import { Injectable } from '@nestjs/common';
import { SpeechService } from '../speech/speech.service';
import { AiService } from '../ai-service/ai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { Repository } from 'typeorm';
import { ChatSession } from '../entities/chat-session.entity';
import { User } from 'src/user/entities/user.entity';
import { error } from 'console';
import { TtsService } from '../tts/tts.service';
import { cleanTextForSpeech } from 'src/utilities/cleanTextForSpeech';

@Injectable()
export class VoiceChatService {
  constructor(
    private speechService: SpeechService,
    private aiService: AiService,
    
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,

    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
    // @InjectRepository(User)
    // private userRepo: Repository<User>,
  ) {}

  

  // async handleVoice(filePath: string,userId: number, sessionId?: string) {
  

  //   //for stt
  //   const userText = await this.speechService.speechToText(filePath);
  //   console.log('user text:', userText); //for debug

  //   let session:any;

  //   if (sessionId) {
  //     session = await this.sessionRepo.findOne({
  //       where: { id: sessionId },
  //     });

  //     if (!session) throw new Error('Session not found');
  //   }

  //   if (!sessionId) {
  //     session = await this.sessionRepo.save({
  //       user: { id: userId },
  //     });
  //   }
  //   //save message into the db
  //   const userMsg = this.messageRepo.create({
  //     content: userText,
  //     role: 'user',
  //     session: session!,
  //   });

  //   await this.messageRepo.save(userMsg);

  //   const aiReply = await this.aiService.generateMessage(userText);
  //   const clearMsg= cleanTextForSpeech(aiReply)

  //   console.log('ai reply:', aiReply);

   

  //   //save message into the db
  //   const aiMsg = this.messageRepo.create({
  //     content: clearMsg,
  //     role: 'assistant',
  //     session: session!,
  //   });

  //   await this.messageRepo.save(aiMsg);

  //   return {
  //     sessionId: session.id,
  //     userText,
  //     clearMsg,
     
  //   };
  // }


  async handleVoiceBuffer(buffer:Buffer,userId: number, sessionId?: string){
       //for stt
    const userText = await this.speechService.speechToText(buffer);
    console.log('user text:', userText); //for debug

    let session:any;

    if (sessionId) {
      session = await this.sessionRepo.findOne({
        where: { id: sessionId },
      });

      if (!session) throw new Error('Session not found');
    }

    if (!sessionId) {
      session = await this.sessionRepo.save({
        user: { id: userId },
      });
    }
    //save message into the db
    const userMsg = this.messageRepo.create({
      content: userText,
      role: 'user',
      session: session!,
    });

    await this.messageRepo.save(userMsg);

    const aiReply = await this.aiService.generateMessage(userText);
    const clearMsg= cleanTextForSpeech(aiReply)

    console.log('ai reply:', aiReply);

   

    //save message into the db
    const aiMsg = this.messageRepo.create({
      content: clearMsg,
      role: 'assistant',
      session: session!,
    });

    await this.messageRepo.save(aiMsg);

    return {
      sessionId: session.id,
      userText,
      clearMsg,
     
    };
  }
}
