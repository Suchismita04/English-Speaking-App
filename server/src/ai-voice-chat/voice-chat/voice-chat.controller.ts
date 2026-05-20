import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceChatService } from './voice-chat.service';
import { diskStorage } from 'multer';

@Controller('voice-chat')
export class VoiceChatController {
  constructor(private readonly voiceService: VoiceChatService) {}
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName = Date.now() + '-' + file.originalname;
          cb(null, fileName);
        },
      }),
    }),
  )
  async handleVoiceController(
    @UploadedFile() file: Express.Multer.File,
    @Body('sessionId') sessionId: string,
  ) {
    return this.voiceService.handleVoice(file.path, sessionId);
  }
}
