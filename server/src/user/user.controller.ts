import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guards";




@Controller('user')
export class UserController{
    constructor (private readonly userService:UserService){}
    @Post('register')
    register(@Body() createUserDto:CreateUserDto){
        return this.userService.registerUser(createUserDto)
    }

    @UseGuards(JwtAuthGuard)
    @Get("getUserProfile")
    async getUserProfile(@Req() req ){
        // console.log("use data:",req.user)
        return await this.userService.findById(req.user.userId)
    }

    @Get("getAllTypesOfUser")
   async getAllTypesOfUser(
        @Query('search') search?: string,
        @Query('gender') gender?: string,
        @Query('fluencyLevel') fluencyLevel?: string,
        @Query('isOnline') isOnline?: string
    ){
        const isOnlineBool = isOnline === 'true' ? true : isOnline === 'false' ? false : undefined;
        return  await this.userService.getAllTypesOfUser(search, gender, fluencyLevel, isOnlineBool)
    }


    
}