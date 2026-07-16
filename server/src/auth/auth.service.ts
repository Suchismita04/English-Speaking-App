import { Injectable, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async signIn(username: string, plainPassword: string): Promise<any> {
        console.log('Login attempt for username:', username);

        const allUsers = await this.userRepo.find({ where: { user_name: username } });
        console.log('All users with this username:', allUsers.length);

        const user = await this.userRepo.findOne({
            where: { user_name: username }
        });

        console.log('User found:', !!user);
        console.log('User ID:', user?.id);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        console.log('Plain password:', plainPassword);
        console.log('Stored password (first 20 chars):', user?.password?.substring(0, 20));

        const hasMatched = bcrypt.compareSync(plainPassword, user?.password);

        console.log('Password match:', hasMatched);

        if (!hasMatched) {
            throw new UnauthorizedException('Invalid password');
        }

        // JWT authentication
        const { password, ...userDetails } = user
        const payload = { sub: userDetails.id, username: userDetails.user_name, email: userDetails.user_email }

        const accessExpire = this.configService.get<any>('ACCESS_TOKEN_EXPIRE') ?? '30m'
        const refreshExpire = this.configService.get<any>('REFRESH_TOKEN_EXPIRE') ?? '1d'

        console.log('Token expiry settings - ACCESS_TOKEN_EXPIRE:', accessExpire, 'type:', typeof accessExpire);
        console.log('Token expiry settings - REFRESH_TOKEN_EXPIRE:', refreshExpire, 'type:', typeof refreshExpire);

        // Convert string numbers to actual numbers for JWT
        const accessExpireValue = typeof accessExpire === 'string' && !isNaN(Number(accessExpire))
            ? Number(accessExpire)
            : accessExpire;
        const refreshExpireValue = typeof refreshExpire === 'string' && !isNaN(Number(refreshExpire))
            ? Number(refreshExpire)
            : refreshExpire;

        console.log('Token expiry after conversion - ACCESS:', accessExpireValue, 'type:', typeof accessExpireValue);
        console.log('Token expiry after conversion - REFRESH:', refreshExpireValue, 'type:', typeof refreshExpireValue);

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            expiresIn: accessExpireValue
        })

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            expiresIn: refreshExpireValue
        })

        console.log('Access token generated (first 50 chars):', accessToken.substring(0, 50));

        return {
            success: true,
            message: 'user logged in successfully...',
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

    
}