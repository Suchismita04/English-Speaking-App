import { Body, BadRequestException, Controller, Get, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guards";

const uploadDir = join(process.cwd(), 'uploads', 'profile-pictures');
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

const profilePictureStorage = diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
});

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    register(@Body() createUserDto: CreateUserDto) {
        return this.userService.registerUser(createUserDto)
    }

    @UseGuards(JwtAuthGuard)
    @Get("getUserProfile")
    async getUserProfile(@Req() req) {
        return await this.userService.getUserProfile(req.user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Get("profile")
    async getProfile(@Req() req) {
        return await this.userService.getUserProfile(req.user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Patch('update')
    async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
        return await this.userService.updateUser(req.user.userId, updateUserDto)
    }

    @UseGuards(JwtAuthGuard)
    @Post('upload-profile-picture')
    @UseInterceptors(FileInterceptor('file', { storage: profilePictureStorage }))
    async uploadProfilePicture(@Req() req, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const profilePictureUrl = `/uploads/profile-pictures/${file.filename}`;
        const updatedUser = await this.userService.updateProfilePicture(req.user.userId, profilePictureUrl);

        return {
            message: 'Profile picture uploaded successfully',
            profilePicture: profilePictureUrl,
            user: updatedUser,
        };
    }

    @Get("getAllTypesOfUser")
    async getAllTypesOfUser(
        @Query('search') search?: string,
        @Query('gender') gender?: string,
        @Query('fluencyLevel') fluencyLevel?: string,
        @Query('isOnline') isOnline?: string
    ) {
        const isOnlineBool = isOnline === 'true' ? true : isOnline === 'false' ? false : undefined;
        return await this.userService.getAllTypesOfUser(search, gender, fluencyLevel, isOnlineBool)
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return await this.userService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return await this.userService.resetPassword(resetPasswordDto);
    }
}