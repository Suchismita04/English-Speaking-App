import { Controller, Post, Get, Delete, Body } from "@nestjs/common";
import { SessionRoomService } from "./session-room.service";
import { CreateSessionRoomDto } from "./dto/create-session-room.dto";


@Controller('session-room')
export class SessionRoomController {

    constructor(private readonly sessionRoomService: SessionRoomService) { }
    //create  rooms 
    @Post('createRoom')
    createRoom(@Body() body: CreateSessionRoomDto) {
        const createdBy = body.createdBy ?? 1  // default for testing, will replace by user  ID from JWT  Auth
        return this.sessionRoomService.createRoom(body.name, body.description, body.logo, createdBy)
    }


    //get list of rooms 
    @Get('getListOfRooms')
    getListOfRooms() {
       return this.sessionRoomService.getListOfRooms();
    }


    // close room from the host side
    @Delete('closeRoom')
    closeRoom() {

    }



}