import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionRoom } from 'src/session-room/entities/session-room.entity';


@Module({
  imports: [TypeOrmModule.forFeature([SessionRoom])],
//   controllers: [SessionRoomController],
//   providers: [SessionRoomService],
})
export class SessionRoomModule {}
