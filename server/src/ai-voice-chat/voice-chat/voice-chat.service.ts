import { Injectable } from "@nestjs/common";
import { AiService } from "../ai-service/ai.service";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessage } from "../entities/chat-message.entity";
import { Repository } from "typeorm";
import { ChatSession } from "../entities/chat-session.entity";

@Injectable()
export class VoiceChatService {
  constructor(
    private aiService: AiService,

    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,

    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
  ) {}


  //this is for rest api testing
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

  async generateReply(
    userText: string,
    userId: number,
    sessionId?: string,
  ) {
    console.log("User said:", userText);

    let session: any;

    // existing session
    if (sessionId) {
      session = await this.sessionRepo.findOne({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error("Session not found");
      }
    }

    //  create new session
    if (!sessionId) {
      session = await this.sessionRepo.save({
        user: { id: userId },
      });
    }

    //  save user message
    const userMsg = this.messageRepo.create({
      content: userText,
      role: "user",
      session: session,
    });

    await this.messageRepo.save(userMsg);

    // AI response
    const aiReply = await this.aiService.generateMessage(userText);

    console.log("AI reply:", aiReply);

    // save AI message
    const aiMsg = this.messageRepo.create({
      content: aiReply,
      role: "assistant",
      session: session,
    });

    await this.messageRepo.save(aiMsg);

    return {
      sessionId: session.id,
      aiReply,
    };
  }
}