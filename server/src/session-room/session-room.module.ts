import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionRoom } from 'src/session-room/entities/session-room.entity';
import { SessionRoomController } from './session-room.controller';
import { SessionRoomService } from './session-room.service';
import { SessionMembershipDetail } from 'src/session-membership/entities/session-membership-details.entity';


@Module({
  imports: [TypeOrmModule.forFeature([SessionRoom,SessionMembershipDetail])],
  controllers: [SessionRoomController],
  providers: [SessionRoomService],
})
export class SessionRoomModule {}
