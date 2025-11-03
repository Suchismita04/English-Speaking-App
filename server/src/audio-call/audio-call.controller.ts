import { Controller, Post, Body } from '@nestjs/common';
import { AudioCallService } from './audio-call.service';

@Controller('audio-call')
export class AudioCallController {
  constructor(private readonly audioCallService: AudioCallService) {}

  @Post('start')
  async startAudioCall(@Body() body: { userId: number }) {
    return await this.audioCallService.startCall(body.userId);
  }

  @Post('end')
  async endAudioCall(@Body() body: { socketId: string }) {
    this.audioCallService.endCall(body.socketId);
    return { status: 'OK', message: 'Call ended' };
  }
}
