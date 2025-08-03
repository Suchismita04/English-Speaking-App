import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionMembershipDetail } from 'src/session-membership/entities/session-membership-details.entity';


@Module({
  imports: [TypeOrmModule.forFeature([SessionMembershipDetail])],
//   controllers: [SessionMembershipDetailController],
//   providers: [SessionMembershipDetailService],
})
export class SessionMembershipDetailModule {}
