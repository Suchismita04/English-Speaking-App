import { Module } from '@nestjs/common';
import { AudioCallService } from './audio-call.service';
import { SignallingModule } from 'src/signaling/signaling.module';
import {AudioCallController} from './audio-call.controller'

@Module({
  imports: [SignallingModule],
  controllers: [AudioCallController],
  providers: [AudioCallService],
})
export class AudioCallModule {}
