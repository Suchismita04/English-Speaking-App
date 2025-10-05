import { Controller, Post, Get, Delete } from "@nestjs/common";



@Controller("session-room")
export class SessionRoomController {


    //create  rooms 
    @Post('createRoom')
    createRoom() {

    }


    //get list of rooms 
    @Get('getListOfRooms')
    getListOfRooms() {

    }


    // close room from the host side
    @Delete('closeRoom')
    closeRoom() {

    }



}