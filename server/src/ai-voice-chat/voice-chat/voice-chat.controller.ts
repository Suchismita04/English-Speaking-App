import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceChatService } from './voice-chat.service';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guards';

@Controller('voice-chat')
export class VoiceChatController {
  constructor(private readonly voiceService: VoiceChatService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
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
    @Req() req:any
  ) {
    return this.voiceService.handleVoice(file.path, req.user.userId,sessionId);
  }
}
