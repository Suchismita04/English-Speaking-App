import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entities";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt'



@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) { }

    async registeruser(dto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepo.findOne({ where: { user_email: dto.user_email } });
        if (existingUser) {
            throw new ConflictException('User already registered')
        }

        const hashedPwd = await bcrypt.hash(dto.password, 10)

        const newUser = this.userRepo.create({ ...dto, password: hashedPwd })

        return this.userRepo.save(newUser)

    }
}