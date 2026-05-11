import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatMessage } from "./chat-message.entity";


@Entity({name:'chat-session'})
export class ChatSession{
@PrimaryGeneratedColumn('uuid')
id!:string

@CreateDateColumn()
createdAt!:Date

@ManyToOne(()=>ChatMessage,message=>message.session)
messages!:ChatMessage[]
}