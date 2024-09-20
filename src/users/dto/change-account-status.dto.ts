import { IsString } from 'class-validator';
import { AccountStates } from '../enums';

export class ChangeAccountStatusDto {
  @IsString()
  readonly reason: string;

  @IsString()
  readonly state: AccountStates;

  @IsString()
  readonly password: string;
}
