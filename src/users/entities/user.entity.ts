import { BaseEntity } from 'src/database/base.entity';
import { Column, Entity } from 'typeorm';
import { AccountStates, UserRoles } from '../enums';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User extends BaseEntity<User> {
  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, unique: true })
  username: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ enum: UserRoles, default: UserRoles.USER })
  role: string;

  @Column({ enum: AccountStates, default: AccountStates.ACTIVE })
  accountState: string;
}
