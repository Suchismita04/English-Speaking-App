import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entities";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private jwtService: JwtService
    ) { }

    async signIn(username: string, plainPassword: string): Promise<any> {
        const user = await this.userRepo.findOne({
            where: { user_name: username }
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        const hasMatched = bcrypt.compareSync(plainPassword, user?.password);

        if (!hasMatched) {
            throw new UnauthorizedException();
        }

        // JWT authentication
        const { password, ...userDetails } = user
        const payload = { sub: userDetails.id, username: userDetails.user_name }

        return {
            access_token: await this.jwtService.signAsync(payload)
        }
    }

    async signOut() {

    }
}