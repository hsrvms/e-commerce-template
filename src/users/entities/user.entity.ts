import { BaseEntity } from 'src/database/base.entity';
import { Column, Entity } from 'typeorm';
import { AccountStates } from '../enums';

@Entity({ name: 'users' })
export class User extends BaseEntity<User> {
  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, unique: true })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ default: AccountStates.ACTIVE })
  accountState: number;
}
