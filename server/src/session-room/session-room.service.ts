import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SessionRoom } from "./entities/session-room.entity";
import { Repository } from "typeorm";
import { SessionMembershipDetail } from "src/session-membership/entities/session-membership-details.entity";


@Injectable()
export class SessionRoomService{
  constructor(
    @InjectRepository(SessionRoom) private roomRepo:Repository <SessionRoom>,
    @InjectRepository(SessionMembershipDetail) private membershipRepo:Repository <SessionMembershipDetail>
  ){}

    async createRoom(){

    }

    async getListOfRooms(){

    }

    async joinRoom(){

    }
}