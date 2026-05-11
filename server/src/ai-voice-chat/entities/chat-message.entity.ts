import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatSession } from "./chat-session.entity";

@Entity({name:'chat-message'})
export class ChatMessage{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column('text')
    content!:string;

    @Column()
    role!:string;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=> ChatSession,session=>session.messages)
    session!:ChatSession
}