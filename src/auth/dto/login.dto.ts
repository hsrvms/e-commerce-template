import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @ApiProperty({
    description: 'The email of the user',
    example: 'john@doe.com',
  })
  readonly email: string;

  @IsString()
  @ApiProperty({
    description: 'The password of the user',
    example: 'StrongPassword_123!',
  })
  readonly password: string;
}
