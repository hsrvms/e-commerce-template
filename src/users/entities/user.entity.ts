import { BaseEntity } from 'src/database/base.entity';
import { Column, Entity } from 'typeorm';
import { AccountStates, UserRoles } from '../enums';
import { Exclude } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class User extends BaseEntity<User> {
  @Column({ length: 255, unique: true })
  @ApiProperty({
    description: 'The email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @Column({ length: 255, unique: true })
  @ApiProperty({
    description: 'The username of the user',
    example: 'johnDoe',
  })
  username: string;

  @Column({ length: 255 })
  @Exclude()
  @ApiHideProperty()
  password: string;

  @Column({ enum: UserRoles, default: UserRoles.USER })
  @ApiProperty({
    description: 'The role of the user in the system',
    example: UserRoles.ADMIN,
    enum: UserRoles,
    default: UserRoles.USER,
  })
  role: string;

  @Column({ enum: AccountStates, default: AccountStates.ACTIVE })
  @ApiProperty({
    description: 'The state of the user',
    example: AccountStates.ACTIVE,
    enum: AccountStates,
    default: AccountStates.ACTIVE,
  })
  accountState: string;
}
