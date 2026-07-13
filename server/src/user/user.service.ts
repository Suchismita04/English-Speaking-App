import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from 'bcrypt';
import { plainToInstance } from "class-transformer";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) { }

  async registerUser(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({ where: { user_email: dto.user_email } });
    if (existingUser) throw new ConflictException('User already registered');

    const salt = await bcrypt.genSalt();
    const hashedPwd = await bcrypt.hash(dto.password, salt);

    const socketId = uuidv4();

    const newUser = this.userRepo.create({
      ...dto,
      password: hashedPwd,
      socket_id: socketId,
    });

    const savedUser = await this.userRepo.save(newUser);
    const savedUserWithoutPwd = plainToInstance(User, savedUser);

    return savedUserWithoutPwd;
  }

  async updateUser(userId: number, dto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatePayload = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined)
    ) as Partial<User>;

    if (dto.password) {
      const salt = await bcrypt.genSalt();
      updatePayload.password = await bcrypt.hash(dto.password, salt);
    }

    await this.userRepo.update({ id: userId }, updatePayload);

    const updatedUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return plainToInstance(User, updatedUser);
  }

  async getAllTypesOfUser(search?: string, gender?: string, fluencyLevel?: string, isOnline?: boolean): Promise<User[]> {
    const queryBuilder = this.userRepo.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        '(user.user_name LIKE :search OR user.user_email LIKE :search OR user.country LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (gender) {
      queryBuilder.andWhere('user.gender = :gender', { gender });
    }

    if (fluencyLevel) {
      queryBuilder.andWhere('user.fluencyLevel = :fluencyLevel', { fluencyLevel });
    }

    if (isOnline !== undefined) {
      queryBuilder.andWhere('user.isOnline = :isOnline', { isOnline });
    }

    return await queryBuilder.getMany();
  }

  async getUserProfile(userId: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(User, user);
  }

  async findById(userId: number): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id: userId } });
  }

  async updateProfilePicture(userId: number, profilePicture: string): Promise<User> {
    const existingUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.update({ id: userId }, { profile_picture: profilePicture });

    const updatedUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return plainToInstance(User, updatedUser);
  }

  async updateSocketId(userId: number, socketId: string | null): Promise<void> {
    await this.userRepo.update({ id: userId }, { socket_id: socketId });
  }

}
