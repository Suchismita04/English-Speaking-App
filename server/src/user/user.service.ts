import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt'
import { plainToInstance } from "class-transformer";



@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) { }

    async registerUser(dto: CreateUserDto): Promise<User> {

        const existingUser = await this.userRepo.findOne({ where: { user_email: dto.user_email } });
        if (existingUser) {
            throw new ConflictException('User already registered')
        }

        const salt = await bcrypt.genSalt()

        const hashedPwd = await bcrypt.hash(dto.password, salt)

        const newUser = this.userRepo.create({ ...dto, password: hashedPwd })

        const savedUser = await this.userRepo.save(newUser);
        const savedUserWithoutPwd = plainToInstance(User, savedUser)


        return savedUserWithoutPwd;
    }
}