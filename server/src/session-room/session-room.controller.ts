import { Controller, Post,Get, Delete } from "@nestjs/common";



@Controller("session-room")
export class SessionRoomController {

    @Post('createRoom')
    createRoom() {

    }

    @Get('getListOfRooms')
    getListOfRooms() {

    }

    @Delete('closeRoom')
    closeRoom(){

    }



}