import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig } from './config/typeorm.config';
import { UserModule } from './user/user.module';
import { SessionRoomModule } from './session-room/session-room.module';
import { SessionMembershipDetailModule } from './session-membership/session-membership.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRootAsync({
      inject:[ConfigService],
      useFactory:typeOrmConfig,
    }),
    UserModule,
    SessionRoomModule,
    SessionMembershipDetailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
