import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entities";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt"


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>
    ) {}

    async signIn(username: string, pass: string): Promise<any> {
        const user = await this.userRepo.findOne({
            where: { user_name: username }
        });

        if (!user) {
            throw new UnauthorizedException();
        }
        bcrypt.compareSync(pass, user?.password);
    }

    async signOut() {

    }
}