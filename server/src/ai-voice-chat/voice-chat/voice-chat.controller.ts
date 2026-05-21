import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceChatService } from './voice-chat.service';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guards';
import { TtsService } from '../tts/tts.service';

@Controller('voice-chat')
export class VoiceChatController {
  constructor(
    private readonly voiceService: VoiceChatService,
    private readonly ttsService: TtsService,
  ) {}
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
    @Req() req: any,
    @Res() res: any,
  ) {
    const response = await this.voiceService.handleVoice(
      file.path,
      req.user.userId,
      sessionId,
    );
    //for tts service
    const audioBuffer = await this.ttsService.textToSpeech(response.clearMsg);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Session-Id', response.sessionId);
    res.setHeader('X-User-Text', encodeURIComponent(response.userText));
    res.setHeader('X-AI-Text', encodeURIComponent(response.clearMsg));

    return res.send(audioBuffer);
  }
}
