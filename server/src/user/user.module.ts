import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entities';
import { SessionRoom } from 'src/session-room/entities/session-room.entity';
import { SessionMembershipDetail } from 'src/session-membership/entities/session-membership-details.entity';
// import { UserService } from './user.service';
// import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User,SessionRoom,SessionMembershipDetail])],
//   controllers: [UserController],
//   providers: [UserService],
})
export class UserModule {}
