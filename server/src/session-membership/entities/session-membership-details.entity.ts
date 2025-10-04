import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SessionRoom } from "src/session-room/entities/session-room.entity";
import { User } from "src/entities/user.entities";

@Entity({ name: 'SessionMembershipDetails' })
export class SessionMembershipDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  room_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => SessionRoom, (sessionRoom) => sessionRoom.memberships)
  @JoinColumn({ name: 'room_id' })
  sessionRoom: SessionRoom;

  @ManyToOne(() => User, (user) => user.memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  joined_at: Date;

  @Column({ type: 'char', length: 1, default: 'Y' })
  is_active: string;
}
