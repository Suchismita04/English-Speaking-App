import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionRoom } from 'src/session-room/entities/session-room.entity';
import { SessionRoomController } from './session-room.controller';
import { SessionRoomService } from './session-room.service';


@Module({
  imports: [TypeOrmModule.forFeature([SessionRoom])],
  controllers: [SessionRoomController],
  providers: [SessionRoomService],
})
export class SessionRoomModule {}
