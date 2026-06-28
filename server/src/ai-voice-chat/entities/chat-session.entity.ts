import { CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatMessage } from "./chat-message.entity";
import { User } from "src/user/entities/user.entity";


@Entity({name:'chat-session'})
export class ChatSession{
@PrimaryGeneratedColumn('uuid')
id!:string

@CreateDateColumn()
createdAt!:Date

@ManyToOne(()=>User,user=>user.chatSessions)
user!:User

@OneToMany(()=>ChatMessage,message=>message.session)
messages!:ChatMessage[]
}