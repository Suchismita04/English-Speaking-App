import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SessionRoom } from "src/session-room/entities/session-room.entity";
import { SessionMembershipDetail } from "src/session-membership/entities/session-membership-details.entity";

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  user_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  user_email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
  updated_at: Date;

  @OneToMany(() => SessionRoom, (sessionRoom) => sessionRoom.createdBy)
  sessionRooms: SessionRoom[];

  @OneToMany(() => SessionMembershipDetail, (membership) => membership.user)
  memberships: SessionMembershipDetail[];
}
