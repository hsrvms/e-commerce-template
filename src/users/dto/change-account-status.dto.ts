import { IsString } from 'class-validator';
import { AccountStates } from '../enums';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeAccountStatusDto {
  @IsString()
  @ApiProperty({
    description: 'The reason for changing the Account Status',
    example: 'Long inactivity',
  })
  readonly reason: string;

  @IsString()
  @ApiProperty({
    description: 'The state of the account',
    example: AccountStates.ACTIVE,
    enum: AccountStates,
  })
  readonly state: AccountStates;

  @IsString()
  @ApiProperty({
    description: 'The password of the user',
    example: 'StrongPassword_123!',
  })
  readonly password: string;
}
