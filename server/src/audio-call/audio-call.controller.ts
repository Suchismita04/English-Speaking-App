import { Controller, Post, Body } from '@nestjs/common';
import { AudioCallService } from './audio-call.service';

@Controller('audio-call')
export class AudioCallController {
  constructor(private readonly audioCallService: AudioCallService) {}

  @Post('start')
  startAudioCall(@Body() body: { userId: string; socketId: string }) {
 
    return this.audioCallService.startCall(body.userId, body.socketId);
  }

  @Post('end')
  endAudioCall(@Body() body: { socketId: string }) {
    this.audioCallService.endCall(body.socketId);
    return { status: 'OK', message: 'Call ended' };
  }
}
